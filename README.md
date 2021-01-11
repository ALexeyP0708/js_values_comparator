# Описание

МОдуль предназначен для быстрого создания правил проверки значений. 
Создание правил можно применять  для конкретных переменных с приметивными значениями, 
так и для свойств обьектов, в том числе проверку обьекта по прототипу.

Такой компонент можно использовать в тестах и в качестве валидации данных.   

В последующем если компонент будет успешен, то будет внедрена возможность обработки ошибок 
с помощью пользовотельских классов обработчиков.
Такой подход необходим при валидации данных и пользовательском информировании о состоянии ошибки.    


Значение можно проверить :
- на соответствие типу
- на соответствие конкретному значению из списка
- на исключения соответствий из списка
- строку проверить на соответствие паттерну регулярного выражения.
- обьект проверить на соотвествие дескрипторов свойств, и на соответствие прототипа.

Если проверке подвергается обьект, то соответственно вложенные обьекты тоже могут подвергаться правилам.

# Классы
 Основную роль по созданию правил  проверке берет на себя класс `ComparisonRule`.  
 
 Проверка на соответствие значению из списка
```js
    let rule=new ComparisonRule({includes:[1,2,3,undefined]},false);
    rule.isEqual(1);// true
    rule.isEqual(undefined);// true
    rule.isEqual('hello');// false
``` 

 Проверка на исключение соответствий значений из списка
 //example: check includes
 ```js
    let rule=new ComparisonRule({excludes:[10]},false);
    rule.isEqual(1);// true
    rule.isEqual({});// true
    rule.isEqual(10);// false
 ```
 
Проверка соответствия строки регулярному выражению
//example: check excludes  
 ```js
    let rule=new ComparisonRule({pattern:/^hello[\s\S]*$/i},false);
    rule.isEqual('hello my friend');// true
    rule.isEqual('bay');// false
 ```

Проверка на соответствие типу
//example: check RegExp
 ```js
     // types=>['null',null,'undefined',undefined,'string','number','boolean','symbol',MyAnyClass, MyAnyProtoObject]
        let rule=new ComparisonRule({types:['string','null','undefined']},false);
        rule.isEqual('hello my friend');// true
        rule.isEqual(null);// true
        rule.isEqual(undefined);// true
        rule.isEqual({});// false
```

Проверка обьекта на принадлежность к классу 
example: check object to class 
  ```js
  class A{}
  class B extends A{};
  class C{};
     let rule=new ComparisonRule({types:['object',A]},false);
     // or 
     // let rule=new ComparisonRule({types:[A]},false);
     rule.isEqual(new B);// true
     rule.isEqual(new A);// true
     rule.isEqual(B);// false
     rule.isEqual(A);// false
     rule.isEqual(new C);// false
  ``` 
  
  Проверка обьекта на прототип обьекта
example: check object to prototype 
 ```js
 let proto={};
 let rule=new ComparisonRule({types:[proto]},false);
 rule.isEqual(Object.create(proto));// true
 rule.isEqual(proto);// true
 rule.isEqual({});// false
 ``` 
  
Проверка класса, на принадлежность к другому классу  
example: check class to class 
  ```js
  class A{}
  class B extends A{};
  class C{};
     let rule=new ComparisonRule({types:['function',A]},false);
     rule.isEqual(B);// true
     rule.isEqual(A);// true
     rule.isEqual(new B);// false
     rule.isEqual(new A);// false
     rule.isEqual(C);// false
  ``` 

//example check descriptors object and prototype
```js
class A{}
let descs={
    prop:{
        //  if "enumerable" or "configurable" or "writable" or "set" or "get" descriptors equal undefined,
        // then no check is performed against such descriptors 
        enumerable:true, // true|false|undefined
        configurable:undefined, // true|false|undefined
        writable:undefined,// true|false|undefined
        value:10 // equivalent -> new ComparisonRule({includes:[10]});
    },
    prop1:{
        value:new ComparisonRule({includes:[3,5,10]})
    },
    react:{
        /*
        If the rule for the getter descriptor is set  a function and the function returns a result, 
        then when checking the object descriptors, the getter will be called for the object property  
        */
        get(){
            //The getter will be called on the object property
            return 10; // equivalent -> return new ComparisonRule({includes:[10]});
            
            // getter will not be called on object property
            //return undefined; 
        },
        set(){}, // we indicate that we want to check if the setter is set
    }
};
let rule=new ComparisonRule({descriptors:descs,proto:A.prototype},false);
let a= new A();

Object.defineProperty(a,'react',{
    configurable:true,
    get(){
        return 10;
    },
    set(value){
        
    }
});
a.prop=10;
a.prop1=10;
rule.isEqual(a);//true;

a.prop1=5;
rule.isEqual(a);//true;

a.prop=9;
rule.isEqual(a);//false;

let b= new A();
b.prop=10;
b.prop1=10;
Object.defineProperty(a,'react',{
    get(){
        return 9;
    },
    set(value){
        
    }
});
rule.isEqual(a);//false;

Object.defineProperty(a,'react',{
    get(){
        return 10;
    },
    set(value){
        
    }
});
Object.defineProperty(a,'prop',{
    enumerable:false
});
rule.isEqual(a);//false;
```

example check object to object template + checking nested objects
```js
let tplObject={
    prop:'hello',
    prop1:{
        prop1_1:{
            prop1_1_1:'bay',
            prop1_1_2:new ComparisonRule({includes:[1,2,3,4]}),
            get react(){return new ComparisonRule({includes:[1,2,3,4]});}
        }
    }
};
let rule=new ComparisonRule({descriptors:Object.getOwnPropertyDescriptors(tplObject)});
let obj={
    prop:'hello',
    prop1:{
        prop1_1:{
            prop1_1_1:'bay',
            prop1_1_2:4,
            get react(){
                return 4
            }
        }
    },
};
rule.isEqual(obj);// true
```

Чтобы при каждом несоответствиии генерировалась ошибка и выводилась в консоли, в конструкторе класса `ComparisonRule`
 2 аргументом необходимо указывать значение "true". Он сообщит обьекту что при проверках необходимо выкидывать исключения.
По умолчанию всегда true. 
Если false, то вместо исключения будет выдоваться результат false.

## Синтаксический сахар

Для удобства использования класса `ComparisonRule`, был создан фабричный класс `Comparator`,
который генерирует обьекты под конкретные задачи.
```js
 
export {Comparator as C} from './export.js';

// includes
Comparator.includesRule([1,2,3]);
//or
C.i([1,2,3]);
// or 
new ComparisonRule({includes:[1,2,3]});

// excludes
Comparator.excludesRule([1,2,3]);
//or
C.e([1,2,3]);
//or
new ComparisonRule({excludes:[1,2,3]});

// types
Comparator.typesRule(['string']);
//or
C.t(['string']);
//or
new ComparisonRule({types:['string']});

// pattern
Comparator.patternRule(/^hello.$/);
//or
C.p(/^hello.$/);
//or
new ComparisonRule({pattern:/^hello.$/});

// descriptors
class A{};
Comparator.descriptorsRule({prop:{value:'hello'}},A.prototype);
//or
C.d({prop:{value:'hello'}},A.prototype);
//or
new ComparisonRule({descriptors:{prop:{value:'hello'}},proto: A.prototype });

// object
class B{};
let templateObject= new B();
Comparator.objectRule(templateObject);
//or
C.o(templateObject);
//or
new ComparisonRule({descriptors:Object.getOwnPropertyDescriptors(templateObject),proto: Object.getPrototypeOf(templateObject)});

class C{};

let templateObject2= {
    prop1:'hello',
    prop2:'bay',
};
Comparator.objectAndProtoRule(templateObject2,C.prototype);
//or
C.op(templateObject2,C.prototype);
//or 
new ComparisonRule({descriptors:Object.getOwnPropertyDescriptors(templateObject),proto: C.prototype});
``` 

Как будет выглядить синтаксический сахар в целом

```js
class Role{};
let rule=C.o({
    user:{
        firstName:C.i(['Alex','Jon']),
        lsatName:C.e(['Job']),
        email:C.p(/^[\w]+@[\w]+.[\w]{2,}/i),
        status:'ok',
    },
    role:C.op({
        administrator:{
            status:false,
        },
        guest:{
            status:true
        }
    },Role.prototype)
},false);
let value={
              user:{
                  firstName:'Alex',
                  lastName:'NoJob',
                  email:'alex@nojob.com',
                  status:'ok'
              },
              role:Object.assign(new Role(),{
                  administrator:{
                      status:false
                  },
                  guest:{
                      status:true,
                  }
              })
          };
rule.isEqual(value);
```

 

