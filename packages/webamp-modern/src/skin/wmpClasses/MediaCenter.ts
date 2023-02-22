export default class MediaCenter {
  //temporary expose as global

  // The effectType method retrieves the registry name of the visualization
  // with the specified registry index.
  // This name is a unique ID defined by the visualization author.
  effectType: number = 0;

  // This attribute is a read/write Number (long) indicating the index of the preset.
  // The indexes begin with zero, which is also the default value.
  effectPreset: number = 0;
}
