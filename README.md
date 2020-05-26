# TipsDeck API

## Client
In use with the TipsDeck React Client located at https://github.com/LSunny5/TipsDeck-App 

## Description 
TipsDeck is a site where you can see a compilation of tips and life hacks that can solve everyday problems without extra tools.  These solutions sometimes fare better than the tools on the market.  This API allows the client to obtain data  from the database and display the results on the client.  

## API Documentation
This is the documentation for the TipsDeck API

### Endpoints: 
#### Base page Test Endpoint 
https://fierce-plains-54443.herokuapp.com/api/ 
JSON:  { "ok": true }

#### List all Categories Endpoint
https://fierce-plains-54443.herokuapp.com/api/Category/
JSON:  [
    {
        "id": 1,
        "category": "Laundry"
    },
    {
        "id": 2,
        "category": "Food"
    },
    {
        "id": 3,
        "category": "Beauty"
    },
    {   ...

#### Post a New Category
POST HEADER https://fierce-plains-54443.herokuapp.com/api/Category/ 
Example Body 
{ 
	"category": "test"
}
JSON 
{
    "id": 13,
    "category": "test"
}

#### Get a single Category
https://fierce-plains-54443.herokuapp.com/api/Category/:id (:id = Category id) 
Example: 
https://fierce-plains-54443.herokuapp.com/api/Category/10
JSON 
{
    "id": 10,
    "category": "Tech"
}

#### Delete Category
https://fierce-plains-54443.herokuapp.com/api/Category/:id (:id = Category id) 
Example: 
https://fierce-plains-54443.herokuapp.com/api/Category/10
JSON: empty

#### Update a category
PATCH Header https://fierce-plains-54443.herokuapp.com/api/Category/:id (:id = Category id) 
Example: 
https://fierce-plains-54443.herokuapp.com/api/Category/10
Example Body 
{ 
	"category": "test 1 edited"
}
JSON 
{
    "id": 10,
    "category": "test 1 edited"
}

#### Get all tips
https://fierce-plains-54443.herokuapp.com/api/Tips/
JSON:  [
    {
        "id": 1,
        "category_id": 11,
        "tipname": "Hiccup Cure",
        "tipdescription": "Have a hiccup you cannot get rid of?  The theory to this trick is that it triggers a gag reflex that overrides hiccups.",
        "directions": "Stick a cotton swab in your mouth and tickle the uvula.",
        "sourcetitle": "\"Urawaza\": 6 Fascinating Japanese Life Hacks",
        "sourceurl": "https://www.lifehack.org/articles/lifestyle/%e2%80%9curawaza%e2%80%9d-6-fascinating-japanese-life-hacks.html",
        "rating": "4.5",
        "numraters": 5
    },
    {   ...

#### Post a tip
POST HEADER https://fierce-plains-54443.herokuapp.com/api/Tips/ 
Example Body 
{ 
	"category": "test"
}
JSON 
{
    "id": 60,
    "category_id": 2,
    "tipname": "test post",
    "tipdescription": "test post description.",
    "directions": "test post direction",
    "sourcetitle": "source title is here",
    "sourceurl": "write a url here",
    "rating": "4.2",
    "numraters": 1
}

#### Get a single tip 
https://fierce-plains-54443.herokuapp.com/api/Tips/:id (:id = Tip id) 
Example: 
https://fierce-plains-54443.herokuapp.com/api/Tips/10
JSON 
{
    "id": 10,
    "category_id": 5,
    "tipname": "Clean cutting board",
    "tipdescription": "Plastic has a tendency to smell over time and discolor.  This technique will sanitize the surface and eliminate odors.",
    "directions": "Wash board with warm soapy water, then cut a lemon in half and rub it on the surface of the cutting board.",
    "sourcetitle": "\"Urawaza\": 6 Fascinating Japanese Life Hacks",
    "sourceurl": "https://www.lifehack.org/articles/lifestyle/%e2%80%9curawaza%e2%80%9d-6-fascinating-japanese-life-hacks.html",
    "rating": "4.2",
    "numraters": 1
}

#### Delete a tip
https://fierce-plains-54443.herokuapp.com/api/Tips/:id (:id = Tip id) 
Example: 
https://fierce-plains-54443.herokuapp.com/api/Tips/10
JSON: empty

#### Update a tip
PATCH Header https://fierce-plains-54443.herokuapp.com/api/Tips/:id (:id = Tip id) 
Example: 
https://fierce-plains-54443.herokuapp.com/api/Tips/10
Example Body 
{ 
	"id": 10,
    "category_id": 5,
    "tipname": "Clean cutting board updated name",
    "tipdescription": "Plastic has a tendency to smell over time and discolor.  This technique will sanitize the surface and eliminate odors.",
    "directions": "Wash board with warm soapy water, then cut a lemon in half and rub it on the surface of the cutting board.",
    "sourcetitle": "\"Urawaza\": 6 Fascinating Japanese Life Hacks",
    "sourceurl": "https://www.lifehack.org/articles/lifestyle/%e2%80%9curawaza%e2%80%9d-6-fascinating-japanese-life-hacks.html",
    "rating": "4.2",
    "numraters": 1
}
JSON 
{
    "id": 10,
    "category_id": 5,
    "tipname": "Clean cutting board  updated name",
    "tipdescription": "Plastic has a tendency to smell over time and discolor.  This technique will sanitize the surface and eliminate odors.",
    "directions": "Wash board with warm soapy water, then cut a lemon in half and rub it on the surface of the cutting board.",
    "sourcetitle": "\"Urawaza\": 6 Fascinating Japanese Life Hacks",
    "sourceurl": "https://www.lifehack.org/articles/lifestyle/%e2%80%9curawaza%e2%80%9d-6-fascinating-japanese-life-hacks.html",
    "rating": "4.2",
    "numraters": 1
}

### Validation errors 
Errors will be thrown for these reasons: 

#### Error example Cannot POST /api/Category/
This message will occur due to the following reasons
##### category
If the category name given is less than 3 or more than 50 characters error message is given and not added to database.  

#### Error example Cannot POST /api/Tips/
This message will occur due to the following reasons
##### Tipname
If the tipname field in body is less than 3 or more than 50 characters an error will be returned and not added to database.  

##### sourcetitle
If the source name given is less than 3 and more than 100 characters error message will be returned and not added to database.  

##### rating
If the averge rating given is less than 0 or more than 5 error message will be returned and not added to database.  

##### numraters
If the number of raters is less than 0 or is not a positive integer than an error will be given and not added to database.  

## Hosted on 
Heroku

## Technologies Used
Node, Express, Knex, PostgreSQL, Postgrator

### Express Boilerplate Used
Boilerplate project used for starting this project.

### Scripts
Start the application `npm start`
Start nodemon for the application `npm run dev`
Run the tests `npm test`

### Deploying
`npm run deploy`