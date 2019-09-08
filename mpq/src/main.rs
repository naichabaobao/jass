
mod w3m;



//fn main() {
//    let c:Char4 = Char4::new('h','w','3','m');
//    println!("{:?}", c);
//
//    let wh:W3MHeader = W3MHeader{id: c,placeholder: 20} ;
//    println!("{:?}", wh);
//    println!("Hello, world!");
//
//
//
//}

use std::vec::Vec;

use w3m::cryption::HashType;
use w3m::cryption::hash_string;

fn main() {
    //  , 0x28 , 0xd9 , 0x32 , 0x98 , 0xbc , 0x73 , 0x6f , 0x9f , 0xb2 , 0x88 , 0x4e , 0xe9
    let v:Vec<u8> = vec![0x33, 0x30 , 0xc3 , 0x79];
    let val = hash_string(v, HashType::HashTableIndexNameA);
    println!("{}", val);
}
