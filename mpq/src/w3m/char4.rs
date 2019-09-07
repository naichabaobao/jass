/**
    用於表示w3m文件中char[4]
*/




impl Char4 {
    pub fn new(zero: char, one: char, two: char, there: char) -> Char4 {
        return Char4 { zero, one, two, there };
    }
}

#[derive(Debug)]
pub struct Char4 {
    zero: char,
    one: char,
    two: char,
    there: char,
}

