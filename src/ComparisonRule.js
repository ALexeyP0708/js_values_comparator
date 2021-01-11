import {ComparisonError} from "./export.js";

export class ComparisonRule {
    constructor(rule = {}, isThrowable = true) {
        this.isThrowable=isThrowable;
        this.init(rule);
    }

    init(rule) {
        if (typeof rule !== 'object' || rule === null) {
            throw new ComparisonError('arguments[0] must be an object');
        }
        if (Object.prototype.hasOwnProperty.call(rule, 'types')) {
            this.types = rule.types;
        }
        if (Object.prototype.hasOwnProperty.call(rule, 'descriptors')) {
            this.descriptors = rule.descriptors;
        }
        if (Object.prototype.hasOwnProperty.call(rule, 'proto')) {
            this.proto = rule.proto;
        }
        if (Object.prototype.hasOwnProperty.call(rule, 'pattern')) {
            this.pattern = rule.pattern;
        }
        if (Object.prototype.hasOwnProperty.call(rule, 'includes')) {
            this.includes = rule.includes;
        }
        if (Object.prototype.hasOwnProperty.call(rule, 'excludes')) {
            this.excludes = rule.excludes;
        }
    }

    /**
     * Defines its own types property as an array of types
     * The following elements are available for an array of types:
     * ['undefined',undefined,'null',null, 'string','number','symbol','function','object','boolean',()=>{}, MyClass, myObject].
     * To check whether an object belongs to a class, you should specify [MyClass] or a combination ['object', MyClass].
     * To check if a class belongs to another class, you must specify the combination ['function', MyClass].
     * To check if an object is a prototype of another object, or the checked object is present in the list, specify prototypes [myObject, myObject2].
     * @param {Array|undefined} value
     * @throws ComparisonError
     */
    set types(value) {
        if (!Array.isArray(value) && value!==undefined) {
            throw new ComparisonError('arguments[0] must be an Array');
        }
        if(value!==undefined){
            // проверить на типы
            let types = [
                'undefined',
                'string',
                'number',
                'boolean',
                'object',
                'symbol',
                'function',
                'null'
            ];
            let errors = [];
            for (let key of Object.keys(value)) {
                if (value[key] === undefined) {
                    value[key] = 'undefined';
                }
                if (value[key] === null) {
                    value[key] = 'null';
                }
                let type = value[key];
                let tp = typeof type;
                if (!['object', 'function', 'string'].includes(tp) || tp === 'string' && !types.includes(type)) {
                    errors.push(`Type "${type}" does not match any of the types in list [${types}].`);
                }
            }
            if (errors.length > 0) {
                errors = ComparisonRule.arrayToStrErrorsMsg(errors);
                errors = errors.replace(/[ ]{2,}/g, ' ');
                throw new ComparisonError(`${errors}`);
            }
        }
        Object.defineProperty(this, 'types', {
            writable: false,
            configurable: false,
            enumerable: true,
            value
        });
    }

    setTypes(value){
        this.types=value;
        return this;
    }

    /**
     * Defines its own proto property
     * Set if it is necessary to check whether an object or function implements a given prototype.
     * @param {object|function|undefined} value
     */
    set proto(value) {
        if (!['object', 'function','undefined'].includes(typeof value) || value === null) {
            throw new ComparisonError('arguments[0] must be an object or function');
        }
        Object.defineProperty(this, 'proto', {
            writable: false,
            configurable: false,
            enumerable: true,
            value
        });
    }

    setProto(value){
        this.proto=value;
        return this;
    }

    /**
     * Set descriptors for properties if you need to check object properties
     * @param { Object.<string, (
     *            { 
     *                enumerable:(boolean|undefined), 
     *                configurable:(boolean|undefined),
     *                writable:(boolean|undefined),
     *                value:*
     *            } | 
     *            {
     *                enumerable:(boolean|undefined), 
     *                configurable:(boolean|undefined),
     *                get:(function|undefined),
     *                set:(function|undefined)
     *            }
     *       )>} rules If one of the descriptor parameters is set to undefined, then the check for this descriptor will not be performed.
     *       If the getter of the property returns a value,
     *       then the getter of the checked property of the object will be called to check the values.
     *       Getter result (get property) or result property "value" will be converted to ComparisonRule {} object   (if the result is not a Comporator{} object).
     */
    set descriptors(rules) {
        if (!['object','undefined'].includes(typeof rules) || rules === null) {
            throw new ComparisonError('arguments[0] must be an object');
        }
        if(rules!==undefined){
            let ProtoClass = Object.getPrototypeOf(this).constructor;
            for (let prop of Object.getOwnPropertyNames(rules)) {
                if (Object.prototype.hasOwnProperty.call(rules[prop], 'get')) {
                    let check = false;
                    if (typeof rules[prop].get === 'function') {
                        rules[prop].get = rules[prop].get();
                        check = true;
                    }
                    if (!(rules[prop].get instanceof ProtoClass)) {
                        let rule = {};
                        if (rules[prop].get !== undefined) {
                            if (typeof rules[prop].get === 'object' && rules[prop].get !== null) {
                                rule = {
                                    descriptors: Object.getOwnPropertyDescriptors(rules[prop].get),
                                    proto: Object.getPrototypeOf(rules[prop].get)
                                };
                            } else {
                                rule = {includes: [rules[prop].get]};
                            }
                            //rule={includes:[rules[prop].get]};
                            rules[prop].get = new ProtoClass(rule,this.isThrowable);
                        } else if (check) {
                            rules[prop].get = new ProtoClass({},this.isThrowable);
                        }
                    }
                } else if (Object.prototype.hasOwnProperty.call(rules[prop], 'value')) {
                    if (!(rules[prop].value instanceof ProtoClass)) {
                        let rule = {};
                        if (typeof rules[prop].value === 'object' && rules[prop].value !== null) {
                            rule = {
                                descriptors: Object.getOwnPropertyDescriptors(rules[prop].value),
                                proto: Object.getPrototypeOf(rules[prop].value)
                            };
                        } else {
                            rule = {includes: [rules[prop].value]};
                        }
                        //rule={includes:[rules[prop].value]};
                        rules[prop].value = new ProtoClass(rule,this.isThrowable);
                    }
                }
            }
        }

        Object.defineProperty(this, 'descriptors', {
            writable: false,
            configurable: false,
            enumerable: true,
            value: rules
        });
    }

    setDescriptors(rules){
        this.descriptors=rules;
        return this;
    }
    /**
     * Defines its own pattern property
     * Set if the checked value is a string and it is necessary to check for a match with a regular expression
     * @param {RegExp} value
     */
    set pattern(value) {
        if (!(value instanceof RegExp) && value!==undefined) {
            throw new ComparisonError('arguments[0] must belong to  "RegExp" class');
        }
        Object.defineProperty(this, 'pattern', {
            writable: false,
            configurable: false,
            enumerable: true,
            value
        });
    }

    setPattern(value){
        this.pattern=value;
        return this;
    }

    /**
     * Defines its own includes property
     * It is set if it is necessary to check if the value matches the value from the list
     * @param {Array} value values ​​with which to compare
     */
    set includes(value) {
        if (!Array.isArray(value) && value!==undefined) {
            throw new ComparisonError('arguments[0] must be an Array');
        }
        if(value!==undefined){
            if (this.excludes !== undefined && this.excludes.length > 0) {
                throw new ComparisonError('It is forbidden to set  "includes" property if "excludes" property is already set');
            }
            value = Object.assign([], value);
            let ProtoClass = Object.getPrototypeOf(this).constructor;
            for (let key of Object.keys(value)) {
                if (typeof value[key] === 'object' && value[key] !== null) {
                    if (!(value[key] instanceof ProtoClass)) {
                        let rule = new ProtoClass({},this.isThrowable);
                        rule.descriptors = Object.getOwnPropertyDescriptors(value[key]);
                        rule.proto = Object.getPrototypeOf(value[key]);
                        value[key] = rule;
                    }
                }
            }
        }
        Object.defineProperty(this, 'includes', {
            writable: false,
            configurable: false,
            enumerable: true,
            value
        });
    }
    setIncludes(value) {
        this.includes=value;
        return this;
    }

    /**
     * Defines its own excludes property
     * It is set if it is necessary to check if the value matches the value from the list
     * @param {Array} value values ​​with which to compare
     */
    set excludes(value) {
        if (!Array.isArray(value) && value!==undefined) {
            throw new ComparisonError('arguments[0] must be an Array');
        }
        if (this.includes !== undefined && this.includes.length > 0) {
            throw new ComparisonError('It is forbidden to set  "excludes" property if "includes" property is already set');
        }
        value = Object.assign([], value);
        let ProtoClass = Object.getPrototypeOf(this).constructor;
        for (let key of Object.keys(value)) {
            if (typeof value[key] === 'object' && value[key] !== null) {
                if (!(value[key] instanceof ProtoClass)) {
                    let rule = new ProtoClass({},this.isThrowable);
                    rule.descriptors = Object.getOwnPropertyDescriptors(value[key]);
                    rule.proto = Object.getPrototypeOf(value[key]);
                    value[key] = rule;
                }
            }
        }
        Object.defineProperty(this, 'excludes', {
            writable: false,
            configurable: false,
            enumerable: true,
            value
        });
    }
    
    setExcludes(value){
        this.excludes=value;
        return this;
    }

    /**
     * checking if the value matches one of the set types
     * @param value
     * @param {string} entryPoints  Service argument. entry point for the call. Designed to generate information in errors.
     * @returns {boolean}
     * @throwable {ComparisonError}
     */
    isEqualToTypes(value, entryPoints = 'root') {
        if (this.types === undefined || this.types.length === 0) {
            return true;
        }

        let tv = typeof value;
        if (value === null) {
            tv = 'null';
        }
        let check = false;
        if (this.types.includes(tv)) {
            check = true;
        }
        switch (tv) {
            case 'object':
                for (let type of this.types) {
                    let tt = typeof type;
                    if (['object', 'function'].includes(tt)) {
                        check = false;
                    }
                    if (
                        (
                            !this.types.includes('function') || this.types.includes('object')
                        ) && (
                            tt === 'object' && (type === value || type.isPrototypeOf(value)) ||
                            tt === 'function' && type.hasOwnProperty('prototype') && value instanceof type
                        )
                    ) {
                        check = true;
                        break;
                    }
                }
                break;
            case 'function':
                for (let type of this.types) {
                    let tt = typeof type;
                    if (['object', 'function'].includes(tt)) {
                        check = false;
                    }
                    if (
                        this.types.includes('function') && (
                            tt === 'object' && value.hasOwnProperty('prototype') && type.isPrototypeOf(value.prototype) ||
                            tt === 'function' && (type === value || type.isPrototypeOf(value))
                        ) 
                    ) {
                        check = true;
                        break;
                    }
                }
                break;
        }

        if (!check) {
            if(!this.isThrowable){
                return false;
            }
            throw new ComparisonError(`(${entryPoints}{types}) Doesn't match types`);
        }
        return true;
    }

    /**
     * checking if the value match to pattern
     * @param {string} value
     * @param {string} entryPoints  Service argument. entry point for the call. Designed to generate information in errors.
     * @returns {boolean}
     * @throwable {ComparisonError}
     */
    isEqualToPattern(value, entryPoints = 'root') {
        if (typeof value !== 'string') {
            if(!this.isThrowable){
                return false;
            }
            throw  new ComparisonError(`(${entryPoints}{pattern})- value type must be string`);
        }
        if (!this.pattern.test(value)) {
            if(!this.isThrowable) {
                return false;
            }
            throw  new ComparisonError(`(${entryPoints}{pattern})- the value does not match the pattern ${this.pattern.toString()}`);

        }
        return true;
    }

    /**
     * checking if the value matches one of the set values in includes list
     * @param value
     * @param {string} entryPoints  Service argument. entry point for the call. Designed to generate information in errors.
     * @returns {boolean}
     * @throwable {ComparisonError}
     */
    isEqualToIncludes(value, entryPoints = 'root') {
        let check = false;
        let errors = [];
        if (this.includes === undefined || this.includes.length <= 0) {
            check = true;
        } else {
            let ProtoClass = Object.getPrototypeOf(this).constructor;
            for (let key of Object.keys(this.includes)) {
                let match = this.includes[key];
                if (match instanceof ProtoClass) {
                    try {
                        if(!match.isEqual(value, entryPoints + `{includes[${key}]}`)){
                            return false;
                        }
                        check = true;
                        break;
                    } catch (e) {
                        errors.push(e.message);
                    }
                } else if (value === match) {
                    check = true;
                    break;
                }
            }
        }
        if (!check) {
            if(!this.isThrowable) {
                return false;
            }

            errors = ComparisonRule.arrayToStrErrorsMsg(errors);
            throw new ComparisonError(`(${entryPoints}{includes})- the value does not match the "includes" rules ${errors}`);
        }
        return true;
    }

    /**
     * checking if the value matches one of the set values in excludes list
     * @param value
     * @param {string} entryPoints  Service argument. entry point for the call. Designed to generate information in errors.
     * @returns {boolean}
     * @throwable {ComparisonError}
     */
    isEqualToExcludes(value, entryPoints = 'root') {
        let check = false;
        let errors = [];
        if (this.excludes !== undefined && this.excludes.length > 0) {
            let ProtoClass = Object.getPrototypeOf(this).constructor;
            for (let key of Object.keys(this.excludes)) {
                let match = this.excludes[key];
                if (match instanceof ProtoClass) {
                    try {
                        if(!match.isEqual(value, entryPoints + `{excludes[${key}]}`)){
                            //errors.push(`(${entryPoints}{excludes[${key}]})- the value does not match the "excludes" rules`);
                            return false;
                        }
                        check = true;
                        break;
                    } catch (e) {
                        //errors.push(e.message);
                    }
                } else if (value === match) {
                    check = true;
                    break;
                }
            }
        }
        if (check) {
            if(!this.isThrowable) {
                return false;
            }
            errors = ComparisonRule.arrayToStrErrorsMsg(errors);
            throw new ComparisonError(`(${entryPoints}{excludes})- the value does not match the "excludes" rules ${errors}`);
        }
        return true;
    }

    /**
     * Checks property descriptors of an object
     * @param object
     * @param {string} entryPoints  Service argument. entry point for the call. Designed to generate information in errors.
     * @returns {boolean}
     * @throwable {ComparisonError}
     */
    isEqualToDescriptors(object, entryPoints = 'root') {
        if (this.descriptors === undefined) {
            //throw new ComparisonError(entryPoints + ': The value is an object. There are no rules for object properties descriptors');
            return true;
        }
        if(typeof object!=='object' || object ===null){
            throw new ComparisonError(`(${entryPoints})- value must be object. `);
        }
        let descs = Object.getOwnPropertyDescriptors(object);
        let ProtoClass = Object.getPrototypeOf(this).constructor;
        let errors = [];
        for (let prop of Object.getOwnPropertyNames(this.descriptors)) {
            try {
                if (!descs.hasOwnProperty(prop)) {
                    if(!this.isThrowable){
                        return false;
                    }
                    errors.push(`(${entryPoints}.${prop})- Property missing`);
                    continue;
                }
                let ruleDesc = this.descriptors[prop];
                if (ruleDesc.configurable !== undefined && ruleDesc.configurable !== descs[prop].configurable) {
                    if(!this.isThrowable){
                        return false;
                    }
                    errors.push(`(${entryPoints}.${prop}{descriptor})- configurable descriptor must be ${ruleDesc.configurable}`);
                }
                if (ruleDesc.enumerable !== undefined && ruleDesc.enumerable !== descs[prop].enumerable) {
                    if(!this.isThrowable){
                        return false;
                    }
                    errors.push(`(${entryPoints}.${prop}{descriptor})- enumerable descriptor must be ${ruleDesc.enumerable}`);
                }
                if (ruleDesc.get !== undefined || ruleDesc.set !== undefined) {
                    if (ruleDesc.hasOwnProperty('set')) {
                        if (ruleDesc.set !== undefined) {
                            if (!descs[prop].hasOwnProperty('set') || descs[prop].set === undefined) {
                                if(!this.isThrowable){
                                    return false;
                                }
                                errors.push(`(${entryPoints}.${prop}{descriptor})- set descriptor must be declared`);
                            }
                        } else {
                            if (descs[prop].hasOwnProperty('set') && descs[prop].set !== undefined) {
                                if(!this.isThrowable){
                                    return false;
                                }
                                errors.push(`(${entryPoints}.${prop}{descriptor})- set descriptor not must be declared`);
                            }
                        }
                    }
                    if (ruleDesc.hasOwnProperty('get')) {
                        if (ruleDesc.get !== undefined) {
                            if (!descs[prop].hasOwnProperty('get') || descs[prop].get === undefined) {
                                if(!this.isThrowable){
                                    return false;
                                }
                                errors.push(`(${entryPoints}.${prop}{descriptor})-  get descriptor must be declared`);
                            }
                        } else {
                            if (descs[prop].hasOwnProperty('get') && descs[prop].get !== undefined) {
                                if(!this.isThrowable){
                                    return false;
                                }
                                errors.push(`(${entryPoints}.${prop}{descriptor})- get descriptor not must be declared`);
                            }
                        }
                        if (ruleDesc.get instanceof ProtoClass &&
                            (
                                ruleDesc.get.descriptors !== undefined ||
                                ruleDesc.get.proto !== undefined ||
                                ruleDesc.get.includes !== undefined && ruleDesc.get.includes.length > 0
                            )) {
                            let getResult;
                            try {
                                getResult = descs[prop].get.call(object);
                            } catch (e) {
                                if(!this.isThrowable){
                                    //throw e;
                                    return false;
                                }
                                errors.push(`(${entryPoints}.${prop}{descriptor})- The getter call failed.` +
                                    `\n${e.message}.\nTo avoid the getter calling , set the descriptor rules to ` +
                                    `{get:()=>undefined} or {get:()=>new ${ProtoClass.name}()}`);
                                continue;
                            }
                            if(!ruleDesc.get.isEqual(getResult, `${entryPoints}.${prop}`)){
                                return false;
                            }
                        }
                    }
                } else if (ruleDesc.hasOwnProperty('value') && descs[prop].hasOwnProperty('value')) {
                    if (ruleDesc.writable !== undefined && ruleDesc.writable !== descs[prop].writable) {
                        if(!this.isThrowable){
                            return false;
                        }
                        errors.push(`(${entryPoints}.${prop}{descriptor})- writable descriptor must be ${ruleDesc.writable}`);
                    }
                    if (!descs[prop].hasOwnProperty('value')) {
                        if(!this.isThrowable){
                            return false;
                        }
                        errors.push(`(${entryPoints}.${prop}{descriptor})-  value descriptor  must be declared`);
                        continue;
                    }
                    if(!ruleDesc.value.isEqual(descs[prop].value, `${entryPoints}.${prop}`)){
                        return false;
                    }
                }
            } catch (e) {
                if (!(e instanceof ComparisonError)) {
                    throw e;
                }
                errors.push(e.message);
            }
        }
        if (errors.length > 0) {
            if(!this.isThrowable){
                return false;
            }
            errors = ProtoClass.arrayToStrErrorsMsg(errors);
            errors = errors.replace(/[ ]{2,}/g, ' ');
            throw new ComparisonError(`${errors}`);
        }
        return true;
    }

    /**
     * Checks prototype of an object or function
     * @param object
     * @param {string} entryPoints  Service argument. entry point for the call. Designed to generate information in errors.
     * @returns {boolean}
     * @throwable {ComparisonError}
     */
    isEqualToProto(value, entryPoints = 'root') {
        if (this.proto !== undefined && ( !['object','function'].includes(typeof value) || value === null)) {
            if(!this.isThrowable){
                return false;
            }
            throw new ComparisonError(`(${entryPoints}{prototype})- value is not an object or function`);
        }
        if (this.proto !== undefined && this.proto !== Object.getPrototypeOf(value)) {
            if(!this.isThrowable){
                return false;
            }
            throw new ComparisonError(`(${entryPoints})- not equal prototype`);
        }
        return true;
    }

    /**
     * Checks the value according to the established rules 
     * @param value
     * @param entryPoints
     * @returns {boolean}
     */
    isEqual(value, entryPoints = 'root') {
        let errors = [];
        if(this.types!==undefined && this.types.length>0){
            try{
                if(!this.isEqualToTypes(value, entryPoints)){
                    return false;
                }
            } catch(e){
                if(!(e instanceof  ComparisonError)){
                    throw e;
                }
                errors.push(e.message);
            }
        }
        if(errors.length===0){
            if (this.descriptors !== undefined || this.proto !== undefined) {
                if (this.descriptors !== undefined) {
                    try {
                        if(!this.isEqualToDescriptors(value, entryPoints)){
                            return false;
                        }
                    } catch (e) {
                        if(!(e instanceof  ComparisonError)){
                            throw e;
                        }
                        errors.push(e.message);
                    }
                }
                if (this.proto !== undefined) {
                    try {
                        if(!this.isEqualToProto(value, entryPoints)){
                            return false;
                        }
                    } catch (e) {
                        if(!(e instanceof  ComparisonError)){
                            throw e;
                        }
                        errors.push(e.message);
                    }
                }
            } else {
                if (this.includes !== undefined && this.includes.length > 0) {
                    try {
                        if(!this.isEqualToIncludes(value, entryPoints)){
                            return false;
                        }
                    } catch (e) {
                        if(!(e instanceof  ComparisonError)){
                            throw e;
                        }
                        errors.push(e.message);
                    }
                } else if (this.excludes !== undefined && this.excludes.length > 0) {
                    try {
                        if(!this.isEqualToExcludes(value, entryPoints)){
                            return false;
                        }
                    } catch (e) {
                        if(!(e instanceof  ComparisonError)){
                            throw e;
                        }
                        errors.push(e.message);
                    }
                }
                if (this.pattern !== undefined) {
                    try {
                        if(!this.isEqualToPattern(value, entryPoints)){
                            return false;
                        }
                    } catch (e) {
                        if(!(e instanceof  ComparisonError)){
                            throw e;
                        }
                        errors.push(e.message);
                    }
                }
            }
        }
        if (errors.length > 0) {
            if(!this.isThrowable) {
                return false;
            }
            errors = ComparisonRule.arrayToStrErrorsMsg(errors);
            throw new ComparisonError(`${errors}`);
        }
        return true;
    }

    static arrayToStrErrorsMsg(errors) {
        if (errors.length > 0) {
            errors = "\n" + errors.join("\n");
            errors = errors.replace(/[\n]+[\s]+(?=\n)|[\n]+/g, "\n ");
            //errors=errors.replace(/[\n]+/g,"\n ");
        } else {
            errors = '';
        }
        return errors;
    }
}
