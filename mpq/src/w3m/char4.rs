/**
    用於表示w3m文件中char[4]
*/



pub trait Char4Interface {
    fn new(zero: char, one: char, two: char, there: char) -> Char4;
}

#[derive("debug")]
pub struct Char4 {
    zero: char,
    one: char,
    two: char,
    there: char,
}

impl Char4Interface for Char4 {
    fn new(zero: char, one: char, two: char, there: char) -> Char4 {
        return Char4 { zero: zero, one: one, two: two, there: there };
    }
}