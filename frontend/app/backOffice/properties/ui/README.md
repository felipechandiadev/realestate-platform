# API Object Documentation for Property Creation

This document explains the structure of the object that the backend expects when creating a new property. Each field is described with its type, whether it is mandatory, and its default value (if applicable).

## Object Structure

### Fields:

1. **title**
   - **Type**: `string`
   - **Mandatory**: Yes
   - **Default**: None
   - **Description**: The title of the property.

2. **description**
   - **Type**: `string`
   - **Mandatory**: No
   - **Default**: None
   - **Description**: A detailed description of the property.

3. **status**
   - **Type**: `enum`
   - **Mandatory**: Yes
   - **Default**: `REQUEST`
   - **Description**: The status of the property. Possible values: `REQUEST`, `APPROVED`, `REJECTED`.

4. **operationType**
   - **Type**: `enum`
   - **Mandatory**: Yes
   - **Default**: None
   - **Description**: The type of operation. Possible values: `SALE`, `RENT`.

5. **price**
   - **Type**: `number`
   - **Mandatory**: Yes
   - **Default**: `0`
   - **Description**: The price of the property.

6. **currencyPrice**
   - **Type**: `enum`
   - **Mandatory**: Yes
   - **Default**: `CLP`
   - **Description**: The currency of the price. Possible values: `CLP`, `UF`.

7. **seoTitle**
   - **Type**: `string`
   - **Mandatory**: No
   - **Default**: None
   - **Description**: SEO title for the property.

8. **seoDescription**
   - **Type**: `string`
   - **Mandatory**: No
   - **Default**: None
   - **Description**: SEO description for the property.

9. **seoKeywords**
   - **Type**: `string`
   - **Mandatory**: No
   - **Default**: None
   - **Description**: SEO keywords for the property.

10. **publicationDate**
    - **Type**: `Date`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The publication date of the property.

11. **isFeatured**
    - **Type**: `boolean`
    - **Mandatory**: No
    - **Default**: `false`
    - **Description**: Whether the property is featured.

12. **propertyTypeId**
    - **Type**: `string`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The ID of the property type.

13. **builtSquareMeters**
    - **Type**: `number`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The built square meters of the property.

14. **landSquareMeters**
    - **Type**: `number`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The land square meters of the property.

15. **bedrooms**
    - **Type**: `number`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The number of bedrooms in the property.

16. **bathrooms**
    - **Type**: `number`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The number of bathrooms in the property.

17. **parkingSpaces**
    - **Type**: `number`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The number of parking spaces in the property.

18. **floors**
    - **Type**: `number`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The number of floors in the property.

19. **constructionYear**
    - **Type**: `number`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The construction year of the property.

20. **state**
    - **Type**: `enum`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The state/region of the property. Possible values: Refer to `RegionEnum`.

21. **city**
    - **Type**: `enum`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The city/commune of the property. Possible values: Refer to `ComunaEnum`.

22. **address**
    - **Type**: `string`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The address of the property.

23. **latitude**
    - **Type**: `number`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The latitude of the property.

24. **longitude**
    - **Type**: `number`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The longitude of the property.

25. **mainImageUrl**
    - **Type**: `string`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: The main image URL of the property.

26. **multimedia**
    - **Type**: `array`
    - **Mandatory**: No
    - **Default**: None
    - **Description**: A list of multimedia objects associated with the property. Each object represents an image, video, or other media file.

### Multimedia Object Structure

Each multimedia object in the `multimedia` array should have the following structure:

1. **id**
   - **Type**: `string`
   - **Mandatory**: Yes
   - **Description**: The unique identifier of the multimedia item.

2. **url**
   - **Type**: `string`
   - **Mandatory**: Yes
   - **Description**: The URL of the multimedia file.

3. **type**
   - **Type**: `string`
   - **Mandatory**: Yes
   - **Description**: The type of multimedia (e.g., `image`, `video`).

4. **description**
   - **Type**: `string`
   - **Mandatory**: No
   - **Description**: A brief description of the multimedia item.

### Enumerations for Property Creation

Below are the enumerations required for creating a property:

1. **PropertyStatus**
   - **Description**: Represents the status of the property.
   - **Values**:
     - `REQUEST`: The property is in request status.
     - `PRE-APPROVED`: The property is pre-approved.
     - `PUBLISHED`: The property is published.
     - `INACTIVE`: The property is inactive.
     - `SOLD`: The property is sold.
     - `RENTED`: The property is rented.

2. **PropertyOperationType**
   - **Description**: Represents the type of operation for the property.
   - **Values**:
     - `SALE`: The property is for sale.
     - `RENT`: The property is for rent.

3. **CurrencyPriceEnum**
   - **Description**: Represents the currency used for the property price.
   - **Values**:
     - `CLP`: Chilean Peso.
     - `UF`: Unidad de Fomento.

4. **RegionEnum**
   - **Description**: Represents the region where the property is located.
   - **Values**: Refer to the backend `RegionEnum` for the complete list of regions.

5. **ComunaEnum**
   - **Description**: Represents the commune (city) where the property is located.
   - **Values**: Refer to the backend `ComunaEnum` for the complete list of communes.

## Example Object

```json
{
  "title": "Modern Apartment",
  "description": "A beautiful apartment in the city center.",
  "status": "APPROVED",
  "operationType": "SALE",
  "price": 200000,
  "currencyPrice": "CLP",
  "seoTitle": "Modern Apartment for Sale",
  "seoDescription": "Spacious and modern apartment located in the heart of the city.",
  "seoKeywords": "apartment, sale, modern, city center",
  "publicationDate": "2025-10-27T00:00:00Z",
  "isFeatured": true,
  "propertyTypeId": "type-12345",
  "builtSquareMeters": 120.5,
  "landSquareMeters": 150.0,
  "bedrooms": 3,
  "bathrooms": 2,
  "parkingSpaces": 1,
  "floors": 1,
  "constructionYear": 2020,
  "state": "METROPOLITAN",
  "city": "SANTIAGO",
  "address": "123 Main Street",
  "latitude": -33.4489,
  "longitude": -70.6693,
  "mainImageUrl": "https://example.com/image.jpg",
  "multimedia": [
    {
      "id": "media-12345",
      "url": "https://example.com/image1.jpg",
      "type": "image",
      "description": "Front view of the property."
    },
    {
      "id": "media-67890",
      "url": "https://example.com/video.mp4",
      "type": "video",
      "description": "Walkthrough of the property."
    }
  ]
}
```