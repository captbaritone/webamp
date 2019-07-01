class Variable {
  constructor(props) {
    this._props = props;
    this.type = props.type;
    this.typeName = props.typeName;
  }

  getValue() {
    return this._value;
  }

  setValue(value) {
    this._value = value;
  }
}

module.exports = Variable;
