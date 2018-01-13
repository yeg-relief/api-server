import uniqBy = require("lodash.uniqby")

describe('uniqBy', () => {
    it('should operate as expected and this is how you import it...', () => {
        const values = [
            {
                x: 1,
                y: 0
            },
            {
               x: 1,
               y: 1
            },
            {
                x: 1,
                y: 0
            }

        ];

        const expected = [
            {
                x: 1,
                y: 0
            },
            {
                x: 1,
                y: 1
            }
        ];


        expect( uniqBy(values, 'y')).toMatchObject(expected);
    });
});