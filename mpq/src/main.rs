
mod w3m;

use w3m::char4::Char4;

fn main() {
    let c:Char4 = Char4::new('h','w','3','m');
    println!("{:?}", c);
    println!("Hello, world!");


}
