import { offsetFromBalance } from "./MainBalance";

describe("offsetFromBalance", () => {
  it("works for positive numbers", () => {
    expect(offsetFromBalance(0)).toBe(0);
    expect(offsetFromBalance(50)).toBe(195);
    expect(offsetFromBalance(100)).toBe(405);
  });
  it("works for negative numbers", () => {
    expect(offsetFromBalance(-0)).toBe(0);
    expect(offsetFromBalance(-50)).toBe(195);
    expect(offsetFromBalance(-100)).toBe(405);
  });
});
