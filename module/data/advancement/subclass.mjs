export default class SubclassConfigurationData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      allowDrops: new foundry.data.fields.BooleanField({
        required: true, initial: true, label: "DND5E.AdvancementConfigureAllowDrops",
        hint: "DND5E.AdvancementConfigureAllowDropsHint"
      }),
      pool: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {
        required: true, label: "DOCUMENT.Items"
      })
    };
  }
}
