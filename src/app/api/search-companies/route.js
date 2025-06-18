// src/app/api/search-companies/route.js
import connectDB from "@/lib/db";
import Company from "@/models/Company";

export async function POST(request) {
  try {
    await connectDB();

    const { fromCity, toCity } = await request.json();

    if (!fromCity || !toCity) {
      return Response.json(
        { error: "Both fromCity and toCity are required" },
        { status: 400 }
      );
    }

<<<<<<< HEAD
    // Clean input data
    const cleanFromCity = fromCity.trim();
    const cleanToCity = toCity.trim();
    
    console.log(`Searching for moving companies from "${cleanFromCity}" to "${cleanToCity}"`);

    // Check if it's same-city moving
    const isSameCity = cleanFromCity.toLowerCase() === cleanToCity.toLowerCase();

    let searchQuery;

    if (isSameCity) {
      // Same-city moving: only need to match one city
      console.log('Performing same-city moving search');
      searchQuery = {
        isVerified: true, // Only show verified companies
        $or: [
          // Service areas include this city (as from or to)
          {
            'serviceAreas': {
              $elemMatch: {
                $or: [
                  { 'from': { $regex: cleanFromCity, $options: 'i' } },
                  { 'to': { $regex: cleanFromCity, $options: 'i' } }
                ]
              }
            }
          },
          // Company address is in this city
          {
            'address.city': { $regex: cleanFromCity, $options: 'i' }
          }
        ]
      };
    } else {
      // Cross-city moving: need to handle moving between two different cities
      console.log('Performing cross-city moving search');
      searchQuery = {
        isVerified: true, // Only show verified companies
        $or: [
          // Exact match: service areas explicitly include this route
          {
            'serviceAreas': {
              $elemMatch: {
                $and: [
                  { 'from': { $regex: cleanFromCity, $options: 'i' } },
                  { 'to': { $regex: cleanToCity, $options: 'i' } }
                ]
              }
            }
          },
          // Reverse match: service areas include the reverse route
          {
            'serviceAreas': {
              $elemMatch: {
                $and: [
                  { 'from': { $regex: cleanToCity, $options: 'i' } },
                  { 'to': { $regex: cleanFromCity, $options: 'i' } }
                ]
              }
            }
          },
          // Flexible match: company is in either origin or destination city and serves the other city
          {
            $and: [
              {
                $or: [
                  { 'address.city': { $regex: cleanFromCity, $options: 'i' } },
                  { 'address.city': { $regex: cleanToCity, $options: 'i' } }
                ]
              },
              {
                'serviceAreas': {
                  $elemMatch: {
                    $or: [
                      { 'from': { $regex: cleanFromCity, $options: 'i' } },
                      { 'to': { $regex: cleanFromCity, $options: 'i' } },
                      { 'from': { $regex: cleanToCity, $options: 'i' } },
                      { 'to': { $regex: cleanToCity, $options: 'i' } }
                    ]
                  }
                }
              }
            ]
          }
        ]
      };
    }

    // Execute search
    const companies = await Company.find(searchQuery)
      .select({
        companyName: 1,
        address: 1,
        description: 1,
        serviceAreas: 1,
        hourlyRate: 1,
        isVerified: 1,
        isKisteKlarCertified: 1,
        documents: 1,
        averageRating: 1,
        reviewsCount: 1,
        logo: 1,
        createdAt: 1
      })
      .sort({ 
        isKisteKlarCertified: -1, // KisteKlar certified companies first
        averageRating: -1,        // Sort by rating descending
        reviewsCount: -1         // Sort by review count descending
      });

    console.log(`Found ${companies.length} matching moving companies`);

    // If no companies found, try a more relaxed search
    let finalCompanies = companies;
    
    if (companies.length === 0 && !isSameCity) {
      console.log('No exact matches found, trying relaxed search...');
      
      // Relaxed search: any company that serves either city
      const relaxedQuery = {
        isVerified: true,
        'serviceAreas': {
          $elemMatch: {
            $or: [
              { 'from': { $regex: cleanFromCity, $options: 'i' } },
              { 'to': { $regex: cleanFromCity, $options: 'i' } },
              { 'from': { $regex: cleanToCity, $options: 'i' } },
              { 'to': { $regex: cleanToCity, $options: 'i' } }
            ]
          }
        }
      };

      finalCompanies = await Company.find(relaxedQuery)
        .select({
          companyName: 1,
          address: 1,
          description: 1,
          serviceAreas: 1,
          hourlyRate: 1,
          isVerified: 1,
          isKisteKlarCertified: 1,
          documents: 1,
          averageRating: 1,
          reviewsCount: 1,
          logo: 1,
          createdAt: 1
        })
        .sort({ 
          isKisteKlarCertified: -1,
          averageRating: -1,
          reviewsCount: -1
        })
        .limit(10); // Limit results from relaxed search

      console.log(`Relaxed search found ${finalCompanies.length} companies`);
    }

    // Process company data, add default values and match scores
    const processedCompanies = finalCompanies.map(company => {
      const companyObj = company.toObject();
      
      // Calculate match score
      let matchScore = 0;
      let matchType = '';
      
      if (companyObj.serviceAreas && companyObj.serviceAreas.length > 0) {
        for (const area of companyObj.serviceAreas) {
          const fromMatch = area.from && area.from.toLowerCase().includes(cleanFromCity.toLowerCase());
          const toMatch = area.to && area.to.toLowerCase().includes(cleanToCity.toLowerCase());
          
          if (isSameCity) {
            if (fromMatch || toMatch) {
              matchScore += 2;
              matchType = 'Same-city service';
            }
          } else {
            if (fromMatch && toMatch) {
              matchScore += 3;
              matchType = 'Direct route';
            } else if (fromMatch || toMatch) {
              matchScore += 1;
              matchType = 'Partial coverage';
            }
          }
        }
      }

      // Bonus for address match
      if (companyObj.address && companyObj.address.city) {
        const cityMatch = companyObj.address.city.toLowerCase().includes(cleanFromCity.toLowerCase()) ||
                         companyObj.address.city.toLowerCase().includes(cleanToCity.toLowerCase());
        if (cityMatch) {
          matchScore += 1;
          if (!matchType) matchType = 'Local company';
        }
      }

      // Bonus for KisteKlar certification
      if (companyObj.isKisteKlarCertified) {
        matchScore += 0.5;
      }

      // Bonus for high rating
      if (companyObj.averageRating >= 4.5) {
        matchScore += 0.3;
      }
=======
    // Search for companies that serve the route or are in the area
    // This is a flexible search that looks for companies:
    // 1. With service areas that match the route
    // 2. Located in the from or to cities
    // 3. With service areas containing either city
    const companies = await Company.find({
      $or: [
        // Companies with service areas that match the route
        {
          serviceAreas: {
            $elemMatch: {
              $or: [
                { from: { $regex: fromCity, $options: "i" } },
                { to: { $regex: toCity, $options: "i" } },
                { from: { $regex: toCity, $options: "i" } },
                { to: { $regex: fromCity, $options: "i" } },
              ],
            },
          },
        },
        // Companies located in the from or to cities
        {
          $or: [
            { "address.city": { $regex: fromCity, $options: "i" } },
            { "address.city": { $regex: toCity, $options: "i" } },
          ],
        },
        // Fallback: get all companies if no specific matches (for testing)
        // Remove this in production if you want strict location matching
        {},
      ],
    })
      .select({
        companyName: 1,
        address: 1,
        description: 1,
        serviceAreas: 1,
        hourlyRate: 1,
        isVerified: 1,
        isKisteKlarCertified: 1,
        documents: 1,
        averageRating: 1,
        reviewsCount: 1,
        logo: 1,
        createdAt: 1,
      })
      .limit(20) // Limit results to prevent overwhelming the account
      .sort({ averageRating: -1 }); // Sort by rating by default

    // Add default values for any missing required fields
    const processedCompanies = companies.map((company) => {
      const companyObj = company.toObject();
>>>>>>> c717bd51c7a8f910f1a2d92058adf9d61e8dd45b

      return {
        ...companyObj,
        // Ensure required fields have default values
        averageRating: companyObj.averageRating || 0,
        reviewsCount: companyObj.reviewsCount || 0,
        hourlyRate: companyObj.hourlyRate || 25,
        isVerified: companyObj.isVerified !== false, // Default true unless explicitly false
        isKisteKlarCertified: companyObj.isKisteKlarCertified || false,
<<<<<<< HEAD
        description: companyObj.description || 'No detailed description available',
        serviceAreas: companyObj.serviceAreas || [],
        documents: companyObj.documents || {
          businessLicense: { verified: false },
          kisteKlarCertificate: { verified: false }
        },
        // Add matching info (for debugging, can be displayed in frontend)
        matchScore,
        matchType: matchType || 'General match'
      };
    });

    // Re-sort by match score
    processedCompanies.sort((a, b) => {
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // If match scores are equal, sort by rating
      return b.averageRating - a.averageRating;
    });

    // Limit number of returned results
    const limitedCompanies = processedCompanies.slice(0, 20);

    console.log(`Returning ${limitedCompanies.length} companies`);
    
    // Add search summary information
    const searchSummary = {
      searchType: isSameCity ? 'same-city' : 'cross-city',
      fromCity: cleanFromCity,
      toCity: cleanToCity,
      totalFound: limitedCompanies.length,
      hasExactMatches: limitedCompanies.some(c => c.matchScore >= 2),
      hasKisteKlarCertified: limitedCompanies.some(c => c.isKisteKlarCertified)
    };

    return Response.json({
      companies: limitedCompanies,
      searchSummary,
      success: true
    });

  } catch (error) {
    console.error('Error searching for companies:', error);
    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
=======
        description: companyObj.description || "No description available",
        serviceAreas: companyObj.serviceAreas || [],
        documents: companyObj.documents || {
          businessLicense: { verified: false },
          kisteKlarCertificate: { verified: false },
        },
      };
    });

    console.log(
      `Found ${processedCompanies.length} companies for route: ${fromCity} → ${toCity}`
    );

    return Response.json(processedCompanies);
  } catch (error) {
    console.error("Error searching companies:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
>>>>>>> c717bd51c7a8f910f1a2d92058adf9d61e8dd45b
  }
}
