
mod w3m;

use w3m::char4::Char4;
use w3m::w3m_header::W3MHeader;

fn main() {
    let c:Char4 = Char4::new('h','w','3','m');
    println!("{:?}", c);

    let wh:W3MHeader = W3MHeader{id: c,placeholder: 20} ;
    println!("{:?}", wh);
    println!("Hello, world!");



}
