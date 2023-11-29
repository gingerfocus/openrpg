use clap::Parser;

#[derive(Parser)]
struct Args {
    #[arg()]
    command: Command,
}

#[derive(Clone, Copy)]
enum Command {
    MassCombat,
    GenerateCharacter,
    ListSpells,
    Ask,
}

fn main() {
    println!("Hello, world!");
}
