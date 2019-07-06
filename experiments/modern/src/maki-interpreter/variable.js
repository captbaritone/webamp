class Variable {
  constructor({ type, typeName }) {
    this.type = type;
    this.typeName = typeName;
  }

  getValue() {
    return this._value;
  }

  setValue(value) {
    this._value = value;
  }
}

module.exports = Variable;
