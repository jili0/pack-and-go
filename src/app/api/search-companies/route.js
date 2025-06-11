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

    // Search for companies that serve the route or are in the area
    // This is a flexible search that looks for companies:
    // 1. With service areas that match the route
    // 2. Located in the from or to cities
    // 3. With service areas containing either city
    const companies = await Company.find({
      $or: [
        // Companies with service areas that match the route
        {
          'serviceAreas': {
            $elemMatch: {
              $or: [
                { 'from': { $regex: fromCity, $options: 'i' } },
                { 'to': { $regex: toCity, $options: 'i' } },
                { 'from': { $regex: toCity, $options: 'i' } },
                { 'to': { $regex: fromCity, $options: 'i' } }
              ]
            }
          }
        },
        // Companies located in the from or to cities
        {
          $or: [
            { 'address.city': { $regex: fromCity, $options: 'i' } },
            { 'address.city': { $regex: toCity, $options: 'i' } }
          ]
        },
        // Fallback: get all companies if no specific matches (for testing)
        // Remove this in production if you want strict location matching
        {}
      ]
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
      createdAt: 1
    })
    .limit(20) // Limit results to prevent overwhelming the user
    .sort({ averageRating: -1 }); // Sort by rating by default

    // Add default values for any missing required fields
    const processedCompanies = companies.map(company => {
      const companyObj = company.toObject();
      
      return {
        ...companyObj,
        // Ensure required fields have default values
        averageRating: companyObj.averageRating || 0,
        reviewsCount: companyObj.reviewsCount || 0,
        hourlyRate: companyObj.hourlyRate || 25, // Default hourly rate
        isVerified: companyObj.isVerified || false,
        isKisteKlarCertified: companyObj.isKisteKlarCertified || false,
        description: companyObj.description || 'No description available',
        serviceAreas: companyObj.serviceAreas || [],
        documents: companyObj.documents || {
          businessLicense: { verified: false },
          kisteKlarCertificate: { verified: false }
        }
      };
    });

    console.log(`Found ${processedCompanies.length} companies for route: ${fromCity} → ${toCity}`);

    return Response.json(processedCompanies);

  } catch (error) {
    console.error('Error searching companies:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}