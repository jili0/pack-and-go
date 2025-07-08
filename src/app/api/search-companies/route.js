// src/app/api/search-companies/route.js
import connectDB from '@/lib/db';
import Company from '@/models/Company';

export async function POST(request) {
  try {
    await connectDB();
    
    const { fromCity, toCity } = await request.json();
    
    if (!fromCity || !toCity) {
      return Response.json(
        { error: 'Both fromCity and toCity are required' },
        { status: 400 }
      );
    }

    // Clean input data
    const cleanFromCity = fromCity.trim();
    const cleanToCity = toCity.trim();
    
    console.log(`Searching for moving companies from "${cleanFromCity}" to "${cleanToCity}"`);

    // Check if it's same-city moving
    const isSameCity = cleanFromCity.toLowerCase() === cleanToCity.toLowerCase();

    let matchStage;

    if (isSameCity) {
      // Same-city moving: only need to match one city
      console.log('Performing same-city moving search');
      matchStage = {
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
      matchStage = {
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

    // Execute search with aggregation to get live review count
    const companies = await Company.aggregate([
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'companyId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          reviewsCount: { $size: '$reviews' },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $avg: '$reviews.rating' },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          companyName: 1,
          address: 1,
          description: 1,
          serviceAreas: 1,
          isVerified: 1,
          isKisteKlarCertified: 1,
          documents: 1,
          averageRating: 1,
          reviewsCount: 1,
          logo: 1,
          createdAt: 1,
          hourlyRate: 1,
          accountId: 1
        }
      },
      {
        $sort: { 
          isKisteKlarCertified: -1, // KisteKlar certified companies first
          averageRating: -1,        // Sort by rating descending
          reviewsCount: -1         // Sort by review count descending
        }
      }
    ]);

    console.log(`Found ${companies.length} matching moving companies`);

    // If no companies found, try a more relaxed search
    let finalCompanies = companies;
    
    if (companies.length === 0 && !isSameCity) {
      console.log('No exact matches found, trying relaxed search...');
      
      // Relaxed search: any company that serves either city
      const relaxedMatchStage = {
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

      finalCompanies = await Company.aggregate([
        {
          $match: relaxedMatchStage
        },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'companyId',
            as: 'reviews'
          }
        },
        {
          $addFields: {
            reviewsCount: { $size: '$reviews' },
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: '$reviews' }, 0] },
                then: { $avg: '$reviews.rating' },
                else: 0
              }
            }
          }
        },
        {
          $project: {
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
            accountId: 1
          }
        },
        {
          $sort: { 
            isKisteKlarCertified: -1,
            averageRating: -1,
            reviewsCount: -1
          }
        },
        {
          $limit: 10
        }
      ]);

      console.log(`Relaxed search found ${finalCompanies.length} companies`);
    }

    // Process company data, add default values and match scores
    const processedCompanies = finalCompanies.map(company => {
      // Calculate match score
      let matchScore = 0;
      let matchType = '';
      
      if (company.serviceAreas && company.serviceAreas.length > 0) {
        for (const area of company.serviceAreas) {
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
      if (company.address && company.address.city) {
        const cityMatch = company.address.city.toLowerCase().includes(cleanFromCity.toLowerCase()) ||
                         company.address.city.toLowerCase().includes(cleanToCity.toLowerCase());
        if (cityMatch) {
          matchScore += 1;
          if (!matchType) matchType = 'Local company';
        }
      }

      // Bonus for KisteKlar certification
      if (company.isKisteKlarCertified) {
        matchScore += 0.5;
      }

      // Bonus for high rating
      if (company.averageRating >= 4.5) {
        matchScore += 0.3;
      }

      return {
        ...company,
        // Ensure required fields have default values
        averageRating: company.averageRating || 0,
        reviewsCount: company.reviewsCount || 0,
        hourlyRate: company.hourlyRate || 25,
        isVerified: company.isVerified || false,
        isKisteKlarCertified: company.isKisteKlarCertified || false,
        description: company.description || 'No detailed description available',
        serviceAreas: company.serviceAreas || [],
        documents: company.documents || {
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
  }
}