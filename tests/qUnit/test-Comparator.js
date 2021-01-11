QUnit.module( 'ComparisonRule class');
import {Comparator as C, ComparisonError} from '../../src/export.js';
QUnit.test('Examples ', function (assert) {
    assert.ok(true);
    {
        // создадим простоt правило  обьекта
        let rule=C.o({
            prop1:{
                prop1_1:{
                    prop1_1_1:'bay'
                }
            },
            prop2:'hello',
        },true);
        assert.throws(function(){
            rule.isEqual({
                prop1:{
                    prop1_1:undefined
                }
            });
        },function(e){
            console.log(e);
            return e instanceof ComparisonError
        });
        C.o({
            prop1:{
                prop1_1:{
                    prop1_1_1:C.t(['number']),
                    prop1_1_2:C.i([1,2,3]),
                    prop1_1_3:C.e([10])
                },
            }
        });
    }
});