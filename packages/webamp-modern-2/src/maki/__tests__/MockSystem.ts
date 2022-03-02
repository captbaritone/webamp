import { getClass } from "../objects";

export function classResolver(guid: string): any {
  switch (guid) {
    case "d6f50f6449b793fa66baf193983eaeef":
      return MockSystem;
    case "45be95e5419120725fbb5c93fd17f1f9":
      return MockGroup;
    case "6129fec14d51dab7ca016591db701b0c":
      return MockGuiList;
  }
  throw new Error(
    `Unresolvable class "${getClass(guid).name}" (guid: ${guid})`
  );
}

export class MockSystem {
  group = new MockGroup();
  getruntimeversion() {
    return 5.666;
  }
  messagebox(
    message: string,
    msgtitle: string,
    flag: number,
    notanymore_id: string
  ) {
    return 1;
  }
  getscriptgroup() {
    return this.group;
  }

  // Not part of the original Maki code, but added to access test data.
  getAssertions(): string[][] {
    return this.group.list.items;
  }
}

class MockGroup {
  list = new MockGuiList();
  getobject(objectId: string) {
    if (objectId !== "results") {
      throw new Error(
        "In this test, we only expect this to be called to get the list."
      );
    }
    return this.list;
  }
}

class MockGuiList {
  items: string[][] = [];
  additem(status: string) {
    this.items.push([status]);
    return 1;
  }
  getlastaddeditempos() {
    return this.items.length - 1;
  }
  setsubitem(i: number, j: number, value: string) {
    this.items[i][j] = value;
  }
}
