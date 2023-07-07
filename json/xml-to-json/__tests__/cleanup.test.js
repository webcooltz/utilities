const cleanupXml = require("../cleanup");

test("cleanup 1 object", () => {
  expect(
    cleanupXml(
      "<student> <firstName>Tyler</firstName>    <lastName>Turner</lastName> </student>"
    )
  ).toBe(
    "<student><firstName>Tyler</firstName><lastName>Turner</lastName></student>"
  );
});
