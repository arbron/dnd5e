const { DocumentIdField, SchemaField } = foundry.data.fields;

/**
 * Field for storing an active effects applied by an activity.
 *
 * @property {string} _id  ID of the effect to apply.
 */
export default class AppliedEffectField extends SchemaField {
  constructor(fields={}, options={}) {
    super({
      _id: new DocumentIdField(),
      ...fields
    }, options);
  }
}
