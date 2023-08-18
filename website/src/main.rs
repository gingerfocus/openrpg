use yew::prelude::*;

// fn main() {
//     yew::start_app::<CounterComponent>();
//     //yew::Renderer::<App>::new().render();
// }

// enum Msg {
//     Add,
// }
//
// struct CounterComponent {
//     count: i64,
// }
//
// impl Component for CounterComponent {
//     type Message = Msg;
//     type Properties = ();
//
//     fn create(_ctx: &Context<Self>) -> Self {
//         Self { count: 0 }
//     }
//
//     fn update(&mut self, _ctx: &Context<Self>, msg: Self::Message) -> bool {
//         match msg {
//             Msg::Add => {
//                 self.count += 1;
//                 true // re-render
//             }
//         }
//     }
//
//     fn view(&self, ctx: &Context<Self>) -> Html {
//         let link = ctx.link();
//         html! {
//             <div>
//                 <p>{ self.count }</p>
//                 <button onclick={link.callback(|_| Msg::Add)}>{ "+1" }</button>
//             </div>
//         }
//     }
// }

#[function_component]
fn App() -> Html {
    let counter = use_state(|| 0);
    let onclick = {
        let counter = counter.clone();
        move |_| {
            let value = *counter + 1;
            counter.set(value);
        }
    };

    html! {
        <div>
            <button {onclick}>{ "+1" }</button>
            <p>{ *counter }</p>
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}

// enum AppMsg {
//     DoThing,
// }
//
// struct App {
//     counter: Context<CounterComponent>
// }
//
//
// impl Component for App {
//     type Message = AppMsg;
//     type Properties = ();
//
//     fn create(ctx: &Context<Self>) -> Self {
//         let counter = ctx.link().create_component::<CounterComponent>();
//         Self { counter }
//     }
//
//     fn update(&mut self, ctx: &Context<Self>, msg: Self::Message) -> bool {
//         false
//     }
//
//     fn view(&self, ctx: &Context<Self>) -> Html {
//         html! {
//             <div class="container">
//                 <>{ self.counter.view(self.counter.component, self.counter) }</>
//                 <p>{ "augbaj" }</p>
//             </div>
//         }
//     }
// }
