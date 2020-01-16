enum ModifierEnum {
  Private= "private",
  Public="public",
  Common="common"
}

interface Modifier{
 modifier:ModifierEnum;
}

export {ModifierEnum,Modifier};