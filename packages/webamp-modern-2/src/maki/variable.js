class Variable {
  constructor({ type, typeName, global }) {
    this.type = type;
    this.typeName = typeName;
    this.global = global;
  }

  getValue() {
    return this._value;
  }

  setValue(value) {
    this._value = value;
  }
}

export default Variable;
