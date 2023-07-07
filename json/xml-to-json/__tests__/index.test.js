const main = require("../index");

test("single xml object", () => {
  expect(
    main(
      "<student><firstName>Tyler</firstName><lastName>Turner</lastName></student>"
    )
  ).toBe('{ "student":  { "firstName": "Tyler", "lastName": "Turner" } }');
});

test("multiple xml objects", () => {
  expect(
    main(
      "<student>  <firstName>Tyler</firstName>    <lastName>Turner</lastName> </student>  <student>   <firstName>Tyler</firstName>    <lastName>Turner</lastName> </student>"
    )
  ).toBe(
    '[{ "student":  { "firstName": "Tyler", "lastName": "Turner" } },{ "student":  { "firstName": "Tyler", "lastName": "Turner" } }]'
  );
});

test("multiple xml objects (messy)", () => {
  expect(
    main(
      '<?xml version="1.0" encoding="UTF-8"?> <student>  <firstName>Tyler</firstName>    <lastName>Turner</lastName> </student>  <student>   <firstName>Tyler</firstName>    <lastName>Turner</lastName> </student>'
    )
  ).toBe(
    '[{ "student":  { "firstName": "Tyler", "lastName": "Turner" } },{ "student":  { "firstName": "Tyler", "lastName": "Turner" } }]'
  );
});

test("container/child xml objects (messy)", () => {
  expect(
    main(
      '<?xmlversion="1.0"encoding="UTF-8"?><breakfast_menu><food><name>BelgianWaffles</name><price>$5.95</price></food><food><name>StrawberryBelgianWaffles</name><price>$7.95</price></food><food><name>Berry-BerryBelgianWaffles</name><price>$8.95</price></food><food><name>FrenchToast</name><price>$4.50</price></food><food><name>HomestyleBreakfast</name><price>$6.95</price></food></breakfast_menu>'
    )
  ).toBe(
    '[{ "student":  { "firstName": "Tyler", "lastName": "Turner" } },{ "student":  { "firstName": "Tyler", "lastName": "Turner" } }]'
  );
});

// test('multiple xml objects with children', () => {
//     expect(main("<student><firstName>Tyler</firstName><lastName>Turner</lastName></student>")).toBe("[{ \"student\":  { \"firstName\": \"Tyler\", \"lastName\": \"Turner\" } },{ \"student\":  { \"firstName\": \"Tyler\", \"lastName\": \"Turner\" } }]");
// });
