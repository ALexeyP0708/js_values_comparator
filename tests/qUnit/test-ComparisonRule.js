QUnit.module( 'ComparisonRule class');
import {ComparisonRule,ComparisonError} from '../../src/export.js';

QUnit.test('Test methods', function (assert) {

    // types 
    {
        class A{};
        let obj={};
        let rule=new ComparisonRule();
        assert.ok(rule.types===undefined,'types property - get empty');
        rule.types=['string',null,undefined,A,obj];

        assert.propEqual(rule.types,['string','null','undefined',A,obj],'types property - set value');

        assert.throws(function(){
            rule=new ComparisonRule({types:['string',1,'no type',null,undefined,A,obj]});
        },function(e){
            return e instanceof ComparisonError;
        },'types property - set value -error');
    }

    //proto
    {
        let rule=new ComparisonRule();
        assert.ok(rule.proto===undefined,'proto property - get empty');

        assert.throws(function(){
            rule.proto=1;
        },function(e){
            return true;
        },'proto property - set bad value');

        let proto={a:'a'};
        rule.proto=proto;
        assert.ok(rule.proto===proto,'proto property - set object');
    }

    // descriptors
    {
        let rule=new ComparisonRule();
        assert.ok(rule.descriptors===undefined,'descriptors property - get empty');
        assert.throws(function(){
            rule.descriptors=1;
        },function(e){
            return true;
        },'descriptors property - set bad value');
        let obj={
            get react(){
                return new ComparisonRule({includes:[1]});
            },
            get react2(){
                return 1;
            },
            value:new ComparisonRule({includes:[1]}),
            value2:1,
        };
        let descs=Object.getOwnPropertyDescriptors(obj);
        rule.descriptors=descs;
        let eqDescGet={
            configurable: true,
            enumerable: true,
            set: undefined,
            get:new ComparisonRule({includes:[1]})
        };
        let eqDescValue={
            configurable: true,
            enumerable: true,
            writable: true,
            value:new ComparisonRule({includes:[1]})
        };
        QUnit.dump.maxDepth=10;
        assert.deepEqual(rule.descriptors,{
            react:eqDescGet,
            react2:eqDescGet,
            value:eqDescValue,
            value2:eqDescValue

        },'descriptors property - set descriptors')
    }

    // pattern
    {
        let rule=new ComparisonRule();

        assert.ok(rule.pattern===undefined,'pattern property - get empty');

        assert.throws(function(){
            rule.pattern={};
        },function(e){
            return true;
        },'pattern property - set bad value');


        let pattern=/hello/;
        rule.pattern=pattern;
        assert.ok(rule.pattern===pattern,'pattern property - set RegExp');
    }

    //includes
    {
        let rule=new ComparisonRule();
        assert.ok(rule.includes===undefined,'includes property - get empty');
        rule.includes=[1];
        assert.propEqual(rule.includes,[1],'includes property - set value is not array');
        rule=Object.create(null);
        Object.setPrototypeOf(rule,ComparisonRule.prototype);
        let includes=['hello',{qwer:1,qwer2:{qwer:1}}];
        rule.includes=includes;
        assert.deepEqual(rule.includes,[
            'hello',
            new ComparisonRule({descriptors:{
                    qwer:{
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value:new ComparisonRule({
                            includes:[1]
                        })
                    },
                    qwer2:{
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value:/*new ComparisonRule({
                            includes:[*/
                            new ComparisonRule({
                                descriptors:{
                                    qwer:{
                                        configurable:true,
                                        enumerable:true,
                                        writable:true,
                                        value:new ComparisonRule({includes:[1]})
                                    }
                                },
                                proto:Object.prototype
                            })
                        /* ]
                     })*/
                    }
                },proto:Object.prototype})
        ],'includes property - set includes');
    }

    //excludes
    {
        let rule=new ComparisonRule();
        assert.ok(rule.excludes===undefined,'excludes property - get empty');
        rule.excludes=[1];
        assert.propEqual(rule.excludes,[1],'excludes property - set value is not array');
        rule=Object.create(null);
        Object.setPrototypeOf(rule,ComparisonRule.prototype);
        let excludes=['hello',{qwer:1,qwer2:{qwer:1}}];
        rule.excludes=excludes;
        assert.deepEqual(rule.excludes,[
            'hello',
            new ComparisonRule({descriptors:{
                    qwer:{
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value:new ComparisonRule({
                            includes:[1]
                        })
                    },
                    qwer2:{
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value:/*new ComparisonRule({
                            includes:[*/
                            new ComparisonRule({
                                descriptors:{
                                    qwer:{
                                        configurable:true,
                                        enumerable:true,
                                        writable:true,
                                        value:new ComparisonRule({
                                            includes:[1]
                                        })
                                    }
                                },
                                proto:Object.prototype
                            })
                        /* ],
                     })*/
                    }
                },proto:Object.prototype})
        ],'excludes property - set excludes');

        /*console.log(new ComparisonRule({includes:[{
                prop1:'hello',
                prop2:new ComparisonRule({includes:[1,2]}),
                get react (){
                    return 1;
                },
                get react2(){
                    return new ComparisonRule({includes:[1,2]})
                },
                prop3:{
                    prop31:[1,2,3],
                    prop32:{
                        prop321:[3,2,1]
                    },
                    prop33:'qwerty'
                }
            }]}));*/
    }

    // isEqualToTypes 
    {
        let rule=new ComparisonRule({types:['string','undefined','null','symbol','number','function','object']});
        assert.ok(rule.isEqualToTypes('hello'),'isEqualToTypes-good value');
        assert.ok(rule.isEqualToTypes(undefined),'isEqualToTypes-good value');
        assert.ok(rule.isEqualToTypes(null),'isEqualToTypes-good value');
        assert.ok(rule.isEqualToTypes(Symbol('sf')),'isEqualToTypes-good value');
        assert.ok(rule.isEqualToTypes(Symbol(1)),'isEqualToTypes-good value');
        assert.ok(rule.isEqualToTypes(()=>{}),'isEqualToTypes-good value');
        assert.ok(rule.isEqualToTypes({}),'isEqualToTypes-good value');
        rule=new ComparisonRule({types:['string']});
        assert.throws(function(){
            rule.isEqualToTypes(1);
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToTypes- primitive value error');
        class A{}
        class B extends A{}
        rule=new ComparisonRule({types:[A]});
        assert.ok(rule.isEqualToTypes(new B()),'isEqualToTypes-value object instanceof class 1');
        rule=new ComparisonRule({types:['object',A]});
        assert.ok(rule.isEqualToTypes(new B()),'isEqualToTypes-value object instanceof class 2');
        rule=new ComparisonRule({types:['function',A]});
        assert.ok(rule.isEqualToTypes(B),'isEqualToTypes-function.isPrototypeOf(value)');
        rule=new ComparisonRule({types:['function','object',A]});
        assert.ok(rule.isEqualToTypes(new B()),'isEqualToTypes- object instanceof class');
        assert.ok(rule.isEqualToTypes(B),'isEqualToTypes-function.isPrototypeOf(value)');

        assert.throws(function(){
            rule.isEqualToTypes(1);
        },function(e){
            return e instanceof ComparisonError;

        },'isEqualToTypes- 1 instanceof class -Error');

        assert.throws(function(){
            rule.isEqualToTypes({});
        },function(e){
            return e instanceof ComparisonError;

        },'isEqualToTypes- {} instanceof class -Error');
        class C{}
        assert.throws(function(){
            rule.isEqualToTypes(C);
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToTypes-function.isPrototypeOf(Class) -Error');
    }

    //isEqualToPattern
    {
        let rule = new ComparisonRule({pattern:/^test[\s\S]*$/i});
        assert.ok(rule.isEqualToPattern('test'),'isEqualToPattern - good value');
        assert.throws(
            function(){
                rule.isEqualToPattern({});
            },
            function(e){
                return true;
            },
            'isEqualToPattern - bad value'
        );
        assert.throws(
            function(){
                rule.isEqualToPattern('hello');
            },
            function(e){
                return true;
            },
            'isEqualToPattern - bad value'
        );
    }

    //isEqualToIncludes
    {
        let rule = new ComparisonRule({});
        assert.ok(rule.isEqualToIncludes({}),'isEqualToIncludes - any value');
        rule = new ComparisonRule({includes:[]});
        assert.ok(rule.isEqualToIncludes({}),'isEqualToIncludes - any value 2');
        rule = new ComparisonRule({includes:[1,2,'hello',new ComparisonRule({includes:['bay',new ComparisonRule({includes:['goodbay',new ComparisonRule({includes:['asdf']}),new ComparisonRule({includes:['asdfsd']})]})]})]});
        assert.ok(rule.isEqualToIncludes(1),'isEqualToIncludes - good value');
        assert.ok(rule.isEqualToIncludes(2),'isEqualToIncludes - good value');
        assert.ok(rule.isEqualToIncludes('hello'),'isEqualToIncludes - good value');
        assert.ok(rule.isEqualToIncludes('bay'),'isEqualToIncludes - good value');
        assert.throws(function(){
                rule.isEqual('hello1');
            },
            function(e){
                return e instanceof ComparisonError;
            },
            'isEqualToIncludes - bad value'
        );


    }

    //isEqualToExcludes
    {
        let rule = new ComparisonRule({});
        assert.ok(rule.isEqualToExcludes({}),'isEqualToExcludes - any value');
        rule = new ComparisonRule({excludes:[]});
        assert.ok(rule.isEqualToExcludes({}),'isEqualToExcludes - any value 2');
        rule = new ComparisonRule({
            excludes:[
                1,
                2,
                'hello',
                new ComparisonRule({
                    includes:[10],
                    /*excludes:[
                        'bay',
                       /!* new ComparisonRule({
                            excludes:[
                                'goodbay',
                                new ComparisonRule({includes:'asdf'}),
                                new ComparisonRule({includes:'asdfsd'})
                            ]
                        })*!/
                    ]*/
                })
            ]
        });
        assert.ok(rule.isEqualToExcludes(9),'isEqualToExcludes - good value');
        assert.throws(function(){
            rule.isEqualToExcludes(1);
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToExcludes - bad value');

        assert.throws(function(){
            rule.isEqualToExcludes(10);
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToExcludes - bad value');

        rule = new ComparisonRule({
            excludes:[
                1,
                2,
                'hello',
                new ComparisonRule({
                    excludes:[
                        'bay',
                        new ComparisonRule({
                            excludes:[
                                'goodbay',
                            ]
                        })
                    ]
                })
            ]
        });
        assert.ok(rule.isEqualToExcludes('bay'),'isEqualToExcludes - good value');
        assert.throws(function(){
            rule.isEqualToExcludes('goodbay');
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToExcludes - bad value');

        rule = new ComparisonRule({
            includes:[
                'bay',
                new ComparisonRule({
                    excludes:[
                        'goodbay',
                    ]
                })
            ]
        });
        assert.ok(rule.isEqual('bay'),'isEqual (includes/excludes) - good value');
        assert.ok(rule.isEqual('fsffew'),'isEqual (includes/excludes) - good value');
        assert.ok(rule.isEqual({}),'isEqual (includes/excludes) - good value');
        assert.throws(function(){
            rule.isEqual('goodbay');
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToExcludes - bad value');
    }

    //isEqualToProto
    {
        class A{};
        class B{};
        let rule = new ComparisonRule({proto:A.prototype});
        rule.isEqualToProto(new A());
        assert.ok( rule.isEqualToProto(new A()),'isEqualToProto-good value');
        assert.throws(function(){
            rule.isEqualToProto(new B());
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToProto- value error');

        assert.throws(function(){
            rule.isEqualToProto('a');
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToProto- value error');
    }

    //isEqualToDescriptors
    {
        let rule = new ComparisonRule({descriptors:Object.getOwnPropertyDescriptors({
                prop1:'hello'
            })});
        let val={

        };
        //console.log(rule.descriptors,Object.getOwnPropertyDescriptors(val));
        assert.throws(function(){
            rule.isEqualToDescriptors(val);
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToDescriptors - property missing');

        Object.defineProperties(val,
            {
                prop1:{
                    value:'hello',
                    configurable:true,
                    writable:true,
                    enumerable:false
                }
            }
        );

        assert.throws(function(){
            rule.isEqualToDescriptors(val);
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToDescriptors - enumerable descriptor error');

        Object.defineProperties(val,
            {
                prop1:{
                    value:'hello',
                    enumerable:true,
                    writable:false,
                }
            }
        );

        assert.throws(function(){
            rule.isEqualToDescriptors(val);
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToDescriptors - writable descriptor error');

        Object.defineProperties(val,
            {
                prop1:{
                    value:'hello',
                    enumerable:true,
                    writable:true,
                    configurable:false,
                }
            }
        );

        assert.throws(function(){
            rule.isEqualToDescriptors(val);
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToDescriptors - configurable descriptor error');

        rule = new ComparisonRule({descriptors:Object.getOwnPropertyDescriptors({
                prop:{
                    prop:{prop:'hello'}
                }
            })});
        val={
            prop:{prop:{prop:'hello2'}},
        };
        assert.throws(function(){
            rule.isEqualToDescriptors(val);
        },function(e){
            return e instanceof ComparisonError;
        },'isEqualToDescriptors - value error');


        rule = new ComparisonRule({descriptors:Object.getOwnPropertyDescriptors({
                set react(v){}
            })});
        val={
            get react(){}
        };
        assert.throws(function(){
            rule.isEqualToDescriptors(val);
        },function(e) {
            return e instanceof ComparisonError;
        },'isEqualToDescriptors - getter/setter error');

        rule = new ComparisonRule({descriptors:Object.getOwnPropertyDescriptors({
                get react(){}
            })});
        val={
            get react(){throw new Error('test')}
        };
        assert.ok(rule.isEqualToDescriptors(val),'isEqualToDescriptors - without calling a getter');

        rule = new ComparisonRule({descriptors:Object.getOwnPropertyDescriptors({
                get react(){return 4;}
            })});
        val={
            get react(){throw new Error('test')}
        };
        assert.throws(function(){
            rule.isEqualToDescriptors(val);
        },function(e) {
            return e instanceof ComparisonError;
        },'isEqualToDescriptors - getter call and error');

        val={
            get react(){return 5;}
        };
        assert.throws(function(){
            rule.isEqualToDescriptors(val);
        },function(e) {
            return e instanceof ComparisonError;
        },'isEqualToDescriptors - getter call and error');
        assert.ok(rule.isEqualToDescriptors({get react(){return 4;}}),'isEqualToDescriptors -  calling a getter');
    }

    // isEqual
    {
        let rule=new ComparisonRule({
            includes:[{prop:{
                    prop:true
                }}]
        },false);
        assert.ok(!rule.isEqual({prop:{prop:false}}),'isEqual-test isThrowable=false');
    }
    
    //examples
    {
        //example: check includes
        {
            let rule=new ComparisonRule({includes:[1,2,3,undefined]},false);
            assert.ok(rule.isEqual(1),'example: check includes 1');
            assert.ok(rule.isEqual(undefined),'example: check includes 1');
            assert.ok(!rule.isEqual('hello'),'example: check includes 3');
        }

        //example: check excludes
        {
            let rule=new ComparisonRule({excludes:[10]},false);
            assert.ok(rule.isEqual(1),'example: check excludes 1');
            assert.ok(rule.isEqual({}),'example: check excludes 2');
            assert.ok(!rule.isEqual(10),'example: check excludes 3');
        }
        //example: check RegExp
        {
            let rule=new ComparisonRule({pattern:/^hello[\s\S]*$/i},false);
            assert.ok(rule.isEqual('hello my friend'),'example: check RegExp 1');
            assert.ok(!rule.isEqual('bay'),'example: check RegExp 2');
        }
        
        //example:check types
        {
            // types=>['null',null,'undefined',undefined,'string','number','boolean','symbol',MyAnyClass, MyAnyProtoObject]
            let rule=new ComparisonRule({types:['string','null','undefined']},false);
            assert.ok(rule.isEqual('hello my friend'),'example:check types 1');// true
            assert.ok(rule.isEqual(null),'example:check types 2');
            assert.ok(rule.isEqual(undefined),'example:check types 3');
            assert.ok(!rule.isEqual({}),'example:check types 4');
        }
        
        //example: check object to class 
        {
            class A{}
            class B extends A{};
            class C{};
            let rule=new ComparisonRule({types:['object',A]},false);
            // or 
            // let rule=new ComparisonRule({types:[A]},false);
            assert.ok(rule.isEqual(new B),'example: object to class  1');// true
            assert.ok(rule.isEqual(new A),'example: object to class  2');// true
            assert.ok(!rule.isEqual(B),'example: object to class  3');// false
            assert.ok(!rule.isEqual(A),'example: object to class  4');// false
            assert.ok(!rule.isEqual(new C),'example: check   object  class implement 5');// false
        }
        
        //example: check object to prototype 
        {
            let proto={};
            let rule=new ComparisonRule({types:[proto]},false);
            assert.ok(rule.isEqual(Object.create(proto)),'example: check object to prototype 1');// true
            assert.ok(rule.isEqual(proto),'example: check object to prototype 2');;// true
            assert.ok(!rule.isEqual({}),'example: check object to prototype 3');;// false
        }
        
        // example: check class to class 
        
        {
            class A{}
            class B extends A{};
            class C{};
            let rule=new ComparisonRule({types:['function',A]},false);
            assert.ok(rule.isEqual(B),'example: check class to class 1');// true
            assert.ok(rule.isEqual(A),'example: check class to class 2');// true
            assert.ok(!rule.isEqual(new B),'example: check class to class 3');// false
            assert.ok(!rule.isEqual(new A),'example: check class to class 4');// false
            assert.ok(!rule.isEqual(C),'example: check class to class 5');// false
        }
        
        
        {
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
        }
        //example check descriptors object
        {
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
            assert.ok(rule.isEqual(a),'example:test descriptors object 1');

            a.prop1=5;
            assert.ok(rule.isEqual(a),'example:test descriptors object 2');

            a.prop=9;
            assert.ok(!rule.isEqual(a),'example:test descriptors object 3');

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
            assert.ok(!rule.isEqual(a),'example:test descriptors object 4');

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
            assert.ok(!rule.isEqual(a),'example:test descriptors object 5');
        }

        //example check object to object template + checking nested objects
        {

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
            let rule=new ComparisonRule({descriptors:Object.getOwnPropertyDescriptors(tplObject)},false);
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
            assert.ok(rule.isEqual(obj));
            obj={
                prop:'hello',
                prop1:{
                    prop1_1:{
                        prop1_1_1:'bay',
                        prop1_1_2:4,
                        get react(){
                            return 5
                        }
                    }
                },
            };
            assert.ok(!rule.isEqual(obj),'example: object template and nested objects 1');
        }
    }
    

});