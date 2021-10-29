export const FORMULA_FIELD = {
  type: String,
  required: true,
  nullable: false,
  default: "",
  formula: true,
  deterministic: false
};

export const DETERMINISTIC_FORMULA_FIELD = {
  type: String,
  required: true,
  nullable: false,
  default: "",
  formula: true,
  deterministic: true,
  validate: d => {
    if ( !Roll ) return true;
    const roll = new Roll(d);
    return roll.isDeterministic;
  },
  validationError: "{name} {field} does not contain a valid formula without dice terms."
};

export function mappingField(options) {
  return {
    type: Object,
    required: options.required ?? false,
    nullable: options.nullable ?? true,
    default: options.default || {},
    clean: d => {
      return Object.fromEntries(Object.entries(d).map(([k, e]) => {
        const d = new options.type(e);
        return [k, d.toObject(false)];
      }));
    },
    validate: d => {
      if ( !(d instanceof Object) ) return false;
      return Object.values(d).every(e => {
        const d = new options.type(e);
        return d.validate();
      });
    },
    validationError: `{name} {field} does not contain valid ${options.type.name} entries`
  };
}

export const NONNEGATIVE_NUMBER_FIELD = {
  type: Number,
  required: false,
  validate: n => Number.isFinite(n) && (n >= 0),
  validationError: '{name} {field} "{value}" does not have an non-negative value'
};

export const NULLABLE_STRING = {
  type: String,
  required: true,
  nullable: true,
  clean: v => v ? String(v).trim() : null,
  default: null
};
