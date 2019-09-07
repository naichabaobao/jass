
impl i84 {
    pub fn new(zero: i8, one: i8, two: i8, there: i8) -> i84 {
        return i84 { zero, one, two, there };
    }
}

///用於描述i8[4]
#[derive(Debug)]
pub struct i84 {
    zero: i8,
    one: i8,
    two: i8,
    there: i8,
}
