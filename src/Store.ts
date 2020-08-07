import { combineReducers } from 'redux'
import axios from 'axios'

export async function getData(method, params, POST = false){
    let store = Store.getState().store;
    let res
    if(!POST){
        res = await axios.get(
            store.url + method
            ,{
            auth: {
                username: unescape(encodeURIComponent(store.user)),
                password: unescape(encodeURIComponent(store.password))
            },
            params
            } 
        ).then(response => response.data)
        .then((data) => {
            return data
        }).catch(error => {
            return {Код: 200, msg: error}
        })
    } else {
        res = await axios.post(
            store.url + method
            ,params
            ,{
                auth: {
                    username: unescape(encodeURIComponent(store.user)),
                    password: unescape(encodeURIComponent(store.password))
                }
            }
        ).then(response => response.data)
        .then((data) => {
            return data
        }).catch(error => {
            return {Код: 200, msg: error}
        })       
    }

    return res;
}

export async function getStore(){
   let res = await axios.get(
         URL + "Магазины"
        ,{
            auth: {
                username: unescape(encodeURIComponent(login)),
                password: unescape(encodeURIComponent(password))
            }
        } 
    ).then(response => response.data)
    .then((data) => {
        return data
    }).catch(error => {
        return {Код: 200, Данные: error}
    })

    return res;
}

const URL = "http://91.185.237.187:2280/Callisto/hs/API/V1/"
const login = "Админ" 
const password = "123456"

interface t_store {
    store:          string,
    description:    string,
    url:            string,
    user:           string,
    password:       string,     
}

interface t_user {
    auth:           boolean,
    user:           string,
    password:       string,
    role:           string,
}

interface t_category{
    Код:            number, 
    url:            string,
    title:          string,
}

export interface t_variant {
    НомерСтроки:    number,
    Характеристика: string,
    Цена:           number,
    Количество:     number,
    Картинка:       string
}

export interface t_goods {
    Код:            number,
    Наименование:   string,
    Цена:           number,
    Картинка:       string,
}

export interface t_basket {
    Код:            number,
    Наименование:   string,
    НомерСтроки:    number,
    Характеристика: string,
    Цена:           number,
    Количество:     number,
    Всего:          number,
    Картинка:       string,
}

interface t_data {

     store:     t_store,

     user:      t_user,

     category:  Array<t_category>,

     goods:     Array<t_goods>,

     basket:    Array<t_basket>,

}

const i_state  : t_data | any = {
    store: {
        store:          "Каллисто",
        description:    "Магазин модной одежды",
        url:            "http://91.185.237.187:2280/Callisto/hs/API/V1/",
        user:           "Админ",
        password:       "123456",   
    },
    user: {
        auth: false,
        user: "Админ",
        password: "123456",
        role: "Admin"
    },
    category: [],
    goods: [],
    basket: [],
}


function    stReducer(state= i_state, action){
    switch(action.type){
        case "store": {
            return { 
                    store: action.store === undefined ? state.store : action.store,
                    description: action.description === undefined ? state.description : action.description,
                    url: action.url === undefined ? state.url : action.url,
                    user: action.user === undefined ? state.user : action.user,
                    password: action.password === undefined ? state.password : action.password
                }
            }
        default: return state;
    }
}

function    usReducer(state= i_state.user, action){
    switch(action.type){
        case "user": {
            return { 
                    auth: action.auth === undefined ? state.auth : action.auth,
                    user: action.user === undefined ? state.user : action.user,
                    password: action.password === undefined ? state.password : action.password,
                    role: action.role === undefined ? state.role : action.role
                }
            }
        default: return state;
    }
}

function    catReducer(state = i_state.category, action){
    switch(action.type){
        case "cat": {
            return action.data
        }
        case "del_cat": return []
        default: return state;
    }
}

function    gdReducer(state = i_state.goods, action){
    switch(action.type){
        case "goods": {
            return action.data
        }
        case "del_goods": return []
        default: return state;
    }
}

function    bsReducer(state = i_state.basket, action) {
    switch(action.type){
      case "add_basket":
        return[
          ...state, action.basket
        ]     
        case "upd_basket":
            return state.map(todo => {
              if (todo.Код === action.basket.Код && todo.НомерСтроки === action.basket.НомерСтроки) {
                return { ...todo, Количество: action.basket.Количество, Всего: action.basket.Всего}
              }
              return todo
            })  
        case "basket": return action.basket 
        case "cl_basket": return []
      default: return state
    }
  
}
  
const       rootReducer = combineReducers({
     
    store:      stReducer,
    user:       usReducer,
    category:   catReducer,
    goods:      gdReducer,
    basket:     bsReducer,
  
})

function create_Store(reducer, initialState) {
    var currentReducer = reducer;
    var currentState = initialState;
    var auth_list = () => {};
    var m_click = () => {};    
    var l_basket = () => {};
    var t_click = () => {};
    return {
        getState() {
            return currentState;
        },
        dispatch(action) {
            currentState = currentReducer(currentState, action);
            switch(action.type){
                case "user": auth_list(); break
                case "m_click": m_click();break                
                case "t_click": t_click();break                
                case "add_basket": l_basket();break                
                case "cl_basket": l_basket();break                
                case "upd_basket": l_basket();break                
                case "basket": l_basket();break
            }
            return action;
        },
        subscribe_auth(newListener) {
            auth_list = newListener;
        },
        subsribe_m_click(newListener) {
            m_click  = newListener
        },        
        subsribe_l_basket(newListener) {
            l_basket  = newListener
        },
        subsribe_t_click(newListener) {
            t_click  = newListener
        }
    };
}

export const Store = create_Store(rootReducer, i_state)

export const i_magazines = [
    {
        store:          "Каллисто",
        description:    "Магазин модной одежды",
        url:            "http://91.185.237.187:2280/Callisto/hs/API/V1/",
        user:           "Админ",
        password:       "123456",   
    }
]
