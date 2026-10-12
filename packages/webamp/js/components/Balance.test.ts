import { balanceValueText } from "./Balance";

describe("balanceValueText", () => {
  it("describes the balance", () => {
    expect(balanceValueText(0)).toBe("Center");
    expect(balanceValueText(-20)).toBe("20% Left");
    expect(balanceValueText(100)).toBe("100% Right");
  });
});
