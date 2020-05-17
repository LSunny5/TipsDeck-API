//fake data for testing categories
function makeCategoriesArray() {
    return [
        {
            id: 1,
            category: 'TestCat1',
        },
        {
            id: 2,
            category: 'TestCat2',
        },
        {
            id: 3,
            category: 'TestCat3',
        },
    ];
};

//make malicious category
function makeMaliciousCategory() {
    const maliciousCategory = {
        id: 123,
        category: 'Naughty <script>alert("xss");</script>',
    }
    const expectedCategory = {
        ...maliciousCategory,
        category: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    }
    return {
        maliciousCategory,
        expectedCategory,
    }
};

//export all functions for tipsdeck endpoints spec
module.exports = {
    makeCategoriesArray,
    makeMaliciousCategory,
};