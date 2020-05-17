//fake data for testing tips
function makeTipsArray() {
    return [
        {
            id: 1,
            category_id: 1,
            tipname: 'TestTip1', 
            tipdescription: 'This is the description for test Tip 1.',
            directions: 'These are the directions for test Tip 1.',
            sourcetitle: 'Test Tip 1 Came From',
            sourceurl: 'https://www.test.com/tip1',
            rating: 5.0,
            numRaters: 10, 
        },
        {
            id: 2,
            category_id: 1,
            tipname: 'TestTip2', 
            tipdescription: 'This is the description for test Tip 2.',
            directions: 'These are the directions for test Tip 2.',
            sourcetitle: 'Test Tip 2 Came From',
            sourceurl: 'https://www.test.com/tip2',
            rating: 4.0,
            numRaters: 9,  
        },
        {
            id: 3,
            category_id: 2,
            tipname: 'TestTip3', 
            tipdescription: 'This is the description for test Tip 3.',
            directions: 'These are the directions for test Tip 3.',
            sourcetitle: 'Test Tip 3 Came From',
            sourceurl: 'https://www.test.com/tip3',
            rating: 3.0,
            numRaters: 8,  
        },
        {
            id: 4,
            category_id: 2,
            tipname: 'TestTip4', 
            tipdescription: 'This is the description for test Tip 4.',
            directions: 'These are the directions for test Tip 4.',
            sourcetitle: 'Test Tip 4 Came From',
            sourceurl: 'https://www.test.com/tip4',
            rating: 2.0,
            numRaters: 7, 
        },
        {
            id: 5,
            category_id: 3,
            tipname: 'TestTip5', 
            tipdescription: 'This is the description for test Tip 5.',
            directions: 'These are the directions for test Tip 5.',
            sourcetitle: 'Test Tip 5 Came From',
            sourceurl: 'https://www.test.com/tip5',
            rating: 1.0,
            numRaters: 6, 
        },
        {
            id: 6,
            category_id: 3,
            tipname: 'TestTip6', 
            tipdescription: 'This is the description for test Tip 6.',
            directions: 'These are the directions for test Tip 6.',
            sourcetitle: 'Test Tip 6 Came From',
            sourceurl: 'https://www.test.com/tip1',
            rating: 0.0,
            numRaters: 5, 
        },
    ];
}

//make malicious tip
function makeMaliciousTip() {
    const maliciousTip = {
        id: 911,
        category_id: 3,
        tipname: 'Naughty Tip Name <script>alert("xss");</script>',
        tipdescription: `Bad description image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>TOO</strong> bad.`, 
        directions: `Bad direction image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>TOO</strong> bad.`,
        sourcetitle: 'Naughty URL title <script>alert("xss");</script>',
        sourceurl: `<img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">`,
        rating: 0.0,
        numRaters: 0
    }
    const expectedTip = {
        ...maliciousTip,
        tipname: 'Naughty Tip Name &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        tipdescription: `Bad description image <img src="https://url.to.file.which/does-not.exist">. But not <strong>TOO</strong> bad.`,
        directions: `Bad description image <img src="https://url.to.file.which/does-not.exist">. But not <strong>TOO</strong> bad.`,
        sourceurl: `<img src="https://url.to.file.which/does-not.exist">`,
        sourcetitle: 'Naughty URL title &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    }
    return {
        maliciousTip,
        expectedTip,
    }
}

//export all functions for the tips endpoint spec
module.exports = {
    makeTipsArray,
    makeMaliciousTip,
};