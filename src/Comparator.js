import {ComparisonRule} from './export.js';
export class Comparator{
    /**
     * Creates a rule with a list of excludes value
     * @param {Array} excludes
     * @param {boolean} isThrow
     * @returns {ComparisonRule}
     */
    static excludesRule(excludes,isThrow=false){
        return new this.ruleClass({excludes},isThrow); 
    }
    
    /**
     * Creates a rule with a list of includes value
     * @param {Array} includes
     * @param {boolean} isThrow
     * @returns {ComparisonRule}
     */
    static includesRule(includes,isThrow=false){
        return new this.ruleClass({includes},isThrow);
    }

    /**
     * Creates a rule with a list of types 
     * @param types
     * @param isThrow
     * @returns {ComparisonRule}
     */
    static typesRule(types,isThrow=false){
        return new this.ruleClass({types},isThrow);
    }

    /**
     * Creates a rule with a list of includes value
     * @param pattern
     * @param isThrow
     */
    static patternRule(pattern,isThrow=false){
        return new this.ruleClass({pattern},isThrow);
    }

    /**
     * Creates a rule to validate the properties of an object through the specified descriptors. 
     * Also optionally sets a prototype check for an object
     * @param {object} descriptors 
     * @param {function|object|undefined} proto
     * @param {boolean} isThrow
     * @returns {Comparator.ruleClass}
     */
    static descriptorsRule(descriptors,proto,isThrow=false){
        let rule={};
        if(descriptors!==undefined){
            rule.descriptors=descriptors;
        }
        if(proto!==undefined){
            rule.proto=proto;
        }
        return new this.ruleClass(rule,isThrow);
    }
    static objectRule(props,isThrow=false){
        let proto=Object.getPrototypeOf(props);
        return  this.descriptorsRule(Object.getOwnPropertyDescriptors(props),proto,isThrow);
    }
    static objectAndProtoRule(props,proto,isThrow=false){
        if(proto===undefined){
            proto=Object.getPrototypeOf(props);
        }
        return  this.descriptorsRule(Object.getOwnPropertyDescriptors(props),proto,isThrow);
    }
    
    static rule(rule,isThrow){
        return new this.ruleClass(rule,isThrow);
    }
}
    Object.defineProperties(Comparator,{
        ruleClass:{
            value:ComparisonRule
        }
});
let descs=Object.getOwnPropertyDescriptors(Comparator);
Object.defineProperties(Comparator,{
    /**
     * @borrows Comparator.excludesRule as e
     */
    e:descs.excludesRule,
    /**
     * @borrows Comparator.includesRule as i
     */
    i:descs.includesRule,
    /**
     * @borrows Comparator.typesRule as t
     */
    t:descs.typesRule,
    /**
     * @borrows Comparator.typesRule as p
     */
    p:descs.patternRule,
    /**
     * @borrows Comparator.descriptorsRule as d
     */
    d:descs.descriptorsRule,
    /**
     * @borrows Comparator.objectRule as o
     */
    o:descs.objectRule,
    /**
     * @borrows Comparator.objectRule as o
     */
    op:descs.objectAndProtoRule,
    /**
     * @borrows Comparator.rule as r
     */
    r:descs.rule,
});




