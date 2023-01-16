use yew::prelude::*;

enum Msg {
    Add,
    //AddMany(toAdd)
}

struct App {
    count: i64
}

impl Component for App {
    type Message = Msg;
    type Properties = ();

    fn create(_ctx: &Context<Self>) -> Self {
        Self { count: 0 }
    }

    fn update(&mut self, _ctx: &Context<Self>, msg: Self::Message) -> bool {
        match msg {
            Msg::Add => {
                self.count += 1;
                true // re-render
            }
        }
    }

    fn view(&self, ctx: &Context<Self>) -> Html {
        let link = ctx.link();
        html! {
            <div class="container">
                <p>{ self.count }</p>
                <button onclick={link.callback(|_| Msg::Add)}>{ "+1" }</button>
            </div>
        }
    }
}

fn main() {
    //yew::start_app::<CounterComponent>();
    yew::Renderer::<App>::new().render();
}
