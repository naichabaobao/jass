enum GlobalModifier {
  Private= "private",
  Public="public",
  Common="common"
}

interface Modifier{
 modifier:GlobalModifier;
}

export {GlobalModifier,Modifier};