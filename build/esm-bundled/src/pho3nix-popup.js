/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const supportsAdoptingStyleSheets="adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,constructionToken=Symbol();class CSSResult{constructor(cssText,safeToken){if(safeToken!==constructionToken){throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.")}this.cssText=cssText}// Note, this is a getter so that it's lazy. In practice, this means
// stylesheets are not created until the first element instance is made.
get styleSheet(){if(this._styleSheet===void 0){// Note, if `adoptedStyleSheets` is supported then we assume CSSStyleSheet
// is constructable.
if(supportsAdoptingStyleSheets){this._styleSheet=new CSSStyleSheet;this._styleSheet.replaceSync(this.cssText)}else{this._styleSheet=null}}return this._styleSheet}toString(){return this.cssText}}/**
   * Wrap a value for interpolation in a css tagged template literal.
   *
   * This is unsafe because untrusted CSS text can be used to phone home
   * or exfiltrate data to an attacker controlled site. Take care to only use
   * this with trusted input.
   */const unsafeCSS=value=>{return new CSSResult(value+"",constructionToken)},textFromCSSResult=value=>{if(value instanceof CSSResult){return value.cssText}else if("number"===typeof value){return value}else{throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`)}},css=(strings,...values)=>{const cssText=values.reduce((acc,v,idx)=>acc+textFromCSSResult(v)+strings[idx+1],strings[0]);return new CSSResult(cssText,constructionToken)};var cssTag={supportsAdoptingStyleSheets:supportsAdoptingStyleSheets,CSSResult:CSSResult,unsafeCSS:unsafeCSS,css:css};/**
    * @license
    * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */const legacyCustomElement=(tagName,clazz)=>{window.customElements.define(tagName,clazz);// Cast as any because TS doesn't recognize the return type as being a
// subtype of the decorated class when clazz is typed as
// `Constructor<HTMLElement>` for some reason.
// `Constructor<HTMLElement>` is helpful to make sure the decorator is
// applied to elements however.
// tslint:disable-next-line:no-any
return clazz},standardCustomElement=(tagName,descriptor)=>{const{kind,elements}=descriptor;return{kind,elements,// This callback is called once the class is otherwise fully defined
finisher(clazz){window.customElements.define(tagName,clazz)}}},customElement=tagName=>classOrDescriptor=>"function"===typeof classOrDescriptor?legacyCustomElement(tagName,classOrDescriptor):standardCustomElement(tagName,classOrDescriptor),standardProperty=(options,element)=>{// When decorating an accessor, pass it through and add property metadata.
// Note, the `hasOwnProperty` check in `createProperty` ensures we don't
// stomp over the user's accessor.
if("method"===element.kind&&element.descriptor&&!("value"in element.descriptor)){return Object.assign({},element,{finisher(clazz){clazz.createProperty(element.key,options)}})}else{// createProperty() takes care of defining the property, but we still
// must return some kind of descriptor, so return a descriptor for an
// unused prototype field. The finisher calls createProperty().
return{kind:"field",key:Symbol(),placement:"own",descriptor:{},// When @babel/plugin-proposal-decorators implements initializers,
// do this instead of the initializer below. See:
// https://github.com/babel/babel/issues/9260 extras: [
//   {
//     kind: 'initializer',
//     placement: 'own',
//     initializer: descriptor.initializer,
//   }
// ],
initializer(){if("function"===typeof element.initializer){this[element.key]=element.initializer.call(this)}},finisher(clazz){clazz.createProperty(element.key,options)}}}},legacyProperty=(options,proto,name)=>{proto.constructor.createProperty(name,options)};/**
    * A property decorator which creates a LitElement property which reflects a
    * corresponding attribute value. A `PropertyDeclaration` may optionally be
    * supplied to configure property features.
    *
    * @ExportDecoratedItems
    */function property(options){// tslint:disable-next-line:no-any decorator
return(protoOrDescriptor,name)=>name!==void 0?legacyProperty(options,protoOrDescriptor,name):standardProperty(options,protoOrDescriptor)}/**
   * A property decorator that converts a class property into a getter that
   * executes a querySelector on the element's renderRoot.
   *
   * @ExportDecoratedItems
   */function query(selector){return(protoOrDescriptor,// tslint:disable-next-line:no-any decorator
name)=>{const descriptor={get(){return this.renderRoot.querySelector(selector)},enumerable:!0,configurable:!0};return name!==void 0?legacyQuery(descriptor,protoOrDescriptor,name):standardQuery(descriptor,protoOrDescriptor)}}/**
   * A property decorator that converts a class property into a getter
   * that executes a querySelectorAll on the element's renderRoot.
   *
   * @ExportDecoratedItems
   */function queryAll(selector){return(protoOrDescriptor,// tslint:disable-next-line:no-any decorator
name)=>{const descriptor={get(){return this.renderRoot.querySelectorAll(selector)},enumerable:!0,configurable:!0};return name!==void 0?legacyQuery(descriptor,protoOrDescriptor,name):standardQuery(descriptor,protoOrDescriptor)}}const legacyQuery=(descriptor,proto,name)=>{Object.defineProperty(proto,name,descriptor)},standardQuery=(descriptor,element)=>({kind:"method",placement:"prototype",key:element.key,descriptor}),standardEventOptions=(options,element)=>{return Object.assign({},element,{finisher(clazz){Object.assign(clazz.prototype[element.key],options)}})},legacyEventOptions=// tslint:disable-next-line:no-any legacy decorator
(options,proto,name)=>{Object.assign(proto[name],options)},eventOptions=options=>// Return value typed as any to prevent TypeScript from complaining that
// standard decorator function signature does not match TypeScript decorator
// signature
// TODO(kschaaf): unclear why it was only failing on this decorator and not
// the others
(protoOrDescriptor,name)=>name!==void 0?legacyEventOptions(options,protoOrDescriptor,name):standardEventOptions(options,protoOrDescriptor);var decorators={customElement:customElement,property:property,query:query,queryAll:queryAll,eventOptions:eventOptions};/**
    * @license
    * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */ /**
        * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
        * replaced at compile time by the munged name for object[property]. We cannot
        * alias this function, so we have to use a small shim that has the same
        * behavior when not compiling.
        */window.JSCompiler_renameProperty=(prop,_obj)=>prop;const defaultConverter={toAttribute(value,type){switch(type){case Boolean:return value?"":null;case Object:case Array:// if the value is `null` or `undefined` pass this through
// to allow removing/no change behavior.
return null==value?value:JSON.stringify(value);}return value},fromAttribute(value,type){switch(type){case Boolean:return null!==value;case Number:return null===value?null:+value;case Object:case Array:return JSON.parse(value);}return value}},notEqual=(value,old)=>{// This ensures (old==NaN, value==NaN) always returns false
return old!==value&&(old===old||value===value)},defaultPropertyDeclaration={attribute:!0,type:String,converter:defaultConverter,reflect:!1,hasChanged:notEqual},microtaskPromise=Promise.resolve(!0),STATE_HAS_UPDATED=1,STATE_UPDATE_REQUESTED=1<<2,STATE_IS_REFLECTING_TO_ATTRIBUTE=1<<3,STATE_IS_REFLECTING_TO_PROPERTY=1<<4,STATE_HAS_CONNECTED=1<<5;/**
    * Change function that returns true if `value` is different from `oldValue`.
    * This method is used as the default for a property's `hasChanged` function.
    */ /**
                                     * Base element class which manages element properties and attributes. When
                                     * properties change, the `update` method is asynchronously called. This method
                                     * should be supplied by subclassers to render updates as desired.
                                     */class UpdatingElement extends HTMLElement{constructor(){super();this._updateState=0;this._instanceProperties=void 0;this._updatePromise=microtaskPromise;this._hasConnectedResolver=void 0;/**
                                             * Map with keys for any properties that have changed since the last
                                             * update cycle with previous values.
                                             */this._changedProperties=new Map;/**
                                          * Map with keys of properties that should be reflected when updated.
                                          */this._reflectingProperties=void 0;this.initialize()}/**
     * Returns a list of attributes corresponding to the registered properties.
     * @nocollapse
     */static get observedAttributes(){// note: piggy backing on this to ensure we're finalized.
this.finalize();const attributes=[];// Use forEach so this works even if for/of loops are compiled to for loops
// expecting arrays
this._classProperties.forEach((v,p)=>{const attr=this._attributeNameForProperty(p,v);if(attr!==void 0){this._attributeToPropertyMap.set(attr,p);attributes.push(attr)}});return attributes}/**
     * Ensures the private `_classProperties` property metadata is created.
     * In addition to `finalize` this is also called in `createProperty` to
     * ensure the `@property` decorator can add property metadata.
     */ /** @nocollapse */static _ensureClassProperties(){// ensure private storage for property declarations.
if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;// NOTE: Workaround IE11 not supporting Map constructor argument.
const superProperties=Object.getPrototypeOf(this)._classProperties;if(superProperties!==void 0){superProperties.forEach((v,k)=>this._classProperties.set(k,v))}}}/**
     * Creates a property accessor on the element prototype if one does not exist.
     * The property setter calls the property's `hasChanged` property option
     * or uses a strict identity check to determine whether or not to request
     * an update.
     * @nocollapse
     */static createProperty(name,options=defaultPropertyDeclaration){// Note, since this can be called by the `@property` decorator which
// is called before `finalize`, we ensure storage exists for property
// metadata.
this._ensureClassProperties();this._classProperties.set(name,options);// Do not generate an accessor if the prototype already has one, since
// it would be lost otherwise and that would never be the user's intention;
// Instead, we expect users to call `requestUpdate` themselves from
// user-defined accessors. Note that if the super has an accessor we will
// still overwrite it
if(options.noAccessor||this.prototype.hasOwnProperty(name)){return}const key="symbol"===typeof name?Symbol():`__${name}`;Object.defineProperty(this.prototype,name,{// tslint:disable-next-line:no-any no symbol in index
get(){return this[key]},set(value){const oldValue=this[name];this[key]=value;this._requestUpdate(name,oldValue)},configurable:!0,enumerable:!0})}/**
     * Creates property accessors for registered properties and ensures
     * any superclasses are also finalized.
     * @nocollapse
     */static finalize(){if(this.hasOwnProperty(JSCompiler_renameProperty("finalized",this))&&this.finalized){return}// finalize any superclasses
const superCtor=Object.getPrototypeOf(this);if("function"===typeof superCtor.finalize){superCtor.finalize()}this.finalized=!0;this._ensureClassProperties();// initialize Map populated in observedAttributes
this._attributeToPropertyMap=new Map;// make any properties
// Note, only process "own" properties since this element will inherit
// any properties defined on the superClass, and finalization ensures
// the entire prototype chain is finalized.
if(this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const props=this.properties,propKeys=[...Object.getOwnPropertyNames(props),...("function"===typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(props):[])];// support symbols in properties (IE11 does not support this)
// This for/of is ok because propKeys is an array
for(const p of propKeys){// note, use of `any` is due to TypeSript lack of support for symbol in
// index types
// tslint:disable-next-line:no-any no symbol in index
this.createProperty(p,props[p])}}}/**
     * Returns the property name for the given attribute `name`.
     * @nocollapse
     */static _attributeNameForProperty(name,options){const attribute=options.attribute;return!1===attribute?void 0:"string"===typeof attribute?attribute:"string"===typeof name?name.toLowerCase():void 0}/**
     * Returns true if a property should request an update.
     * Called when a property value is set and uses the `hasChanged`
     * option for the property if present or a strict identity check.
     * @nocollapse
     */static _valueHasChanged(value,old,hasChanged=notEqual){return hasChanged(value,old)}/**
     * Returns the property value for the given attribute value.
     * Called via the `attributeChangedCallback` and uses the property's
     * `converter` or `converter.fromAttribute` property option.
     * @nocollapse
     */static _propertyValueFromAttribute(value,options){const type=options.type,converter=options.converter||defaultConverter,fromAttribute="function"===typeof converter?converter:converter.fromAttribute;return fromAttribute?fromAttribute(value,type):value}/**
     * Returns the attribute value for the given property value. If this
     * returns undefined, the property will *not* be reflected to an attribute.
     * If this returns null, the attribute will be removed, otherwise the
     * attribute will be set to the value.
     * This uses the property's `reflect` and `type.toAttribute` property options.
     * @nocollapse
     */static _propertyValueToAttribute(value,options){if(options.reflect===void 0){return}const type=options.type,converter=options.converter,toAttribute=converter&&converter.toAttribute||defaultConverter.toAttribute;return toAttribute(value,type)}/**
     * Performs element initialization. By default captures any pre-set values for
     * registered properties.
     */initialize(){this._saveInstanceProperties();// ensures first update will be caught by an early access of
// `updateComplete`
this._requestUpdate()}/**
     * Fixes any properties set on the instance before upgrade time.
     * Otherwise these would shadow the accessor and break these properties.
     * The properties are stored in a Map which is played back after the
     * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
     * (<=41), properties created for native platform properties like (`id` or
     * `name`) may not have default values set in the element constructor. On
     * these browsers native properties appear on instances and therefore their
     * default value will overwrite any element default (e.g. if the element sets
     * this.id = 'id' in the constructor, the 'id' will become '' since this is
     * the native platform default).
     */_saveInstanceProperties(){// Use forEach so this works even if for/of loops are compiled to for loops
// expecting arrays
this.constructor._classProperties.forEach((_v,p)=>{if(this.hasOwnProperty(p)){const value=this[p];delete this[p];if(!this._instanceProperties){this._instanceProperties=new Map}this._instanceProperties.set(p,value)}})}/**
     * Applies previously saved instance properties.
     */_applyInstanceProperties(){// Use forEach so this works even if for/of loops are compiled to for loops
// expecting arrays
// tslint:disable-next-line:no-any
this._instanceProperties.forEach((v,p)=>this[p]=v);this._instanceProperties=void 0}connectedCallback(){this._updateState=this._updateState|STATE_HAS_CONNECTED;// Ensure first connection completes an update. Updates cannot complete
// before connection and if one is pending connection the
// `_hasConnectionResolver` will exist. If so, resolve it to complete the
// update, otherwise requestUpdate.
if(this._hasConnectedResolver){this._hasConnectedResolver();this._hasConnectedResolver=void 0}}/**
     * Allows for `super.disconnectedCallback()` in extensions while
     * reserving the possibility of making non-breaking feature additions
     * when disconnecting at some point in the future.
     */disconnectedCallback(){}/**
                             * Synchronizes property values when attributes change.
                             */attributeChangedCallback(name,old,value){if(old!==value){this._attributeToProperty(name,value)}}_propertyToAttribute(name,value,options=defaultPropertyDeclaration){const ctor=this.constructor,attr=ctor._attributeNameForProperty(name,options);if(attr!==void 0){const attrValue=ctor._propertyValueToAttribute(value,options);// an undefined value does not change the attribute.
if(attrValue===void 0){return}// Track if the property is being reflected to avoid
// setting the property again via `attributeChangedCallback`. Note:
// 1. this takes advantage of the fact that the callback is synchronous.
// 2. will behave incorrectly if multiple attributes are in the reaction
// stack at time of calling. However, since we process attributes
// in `update` this should not be possible (or an extreme corner case
// that we'd like to discover).
// mark state reflecting
this._updateState=this._updateState|STATE_IS_REFLECTING_TO_ATTRIBUTE;if(null==attrValue){this.removeAttribute(attr)}else{this.setAttribute(attr,attrValue)}// mark state not reflecting
this._updateState=this._updateState&~STATE_IS_REFLECTING_TO_ATTRIBUTE}}_attributeToProperty(name,value){// Use tracking info to avoid deserializing attribute value if it was
// just set from a property setter.
if(this._updateState&STATE_IS_REFLECTING_TO_ATTRIBUTE){return}const ctor=this.constructor,propName=ctor._attributeToPropertyMap.get(name);if(propName!==void 0){const options=ctor._classProperties.get(propName)||defaultPropertyDeclaration;// mark state reflecting
this._updateState=this._updateState|STATE_IS_REFLECTING_TO_PROPERTY;this[propName]=// tslint:disable-next-line:no-any
ctor._propertyValueFromAttribute(value,options);// mark state not reflecting
this._updateState=this._updateState&~STATE_IS_REFLECTING_TO_PROPERTY}}/**
     * This private version of `requestUpdate` does not access or return the
     * `updateComplete` promise. This promise can be overridden and is therefore
     * not free to access.
     */_requestUpdate(name,oldValue){let shouldRequestUpdate=!0;// If we have a property key, perform property update steps.
if(name!==void 0){const ctor=this.constructor,options=ctor._classProperties.get(name)||defaultPropertyDeclaration;if(ctor._valueHasChanged(this[name],oldValue,options.hasChanged)){if(!this._changedProperties.has(name)){this._changedProperties.set(name,oldValue)}// Add to reflecting properties set.
// Note, it's important that every change has a chance to add the
// property to `_reflectingProperties`. This ensures setting
// attribute + property reflects correctly.
if(!0===options.reflect&&!(this._updateState&STATE_IS_REFLECTING_TO_PROPERTY)){if(this._reflectingProperties===void 0){this._reflectingProperties=new Map}this._reflectingProperties.set(name,options)}}else{// Abort the request if the property should not be considered changed.
shouldRequestUpdate=!1}}if(!this._hasRequestedUpdate&&shouldRequestUpdate){this._enqueueUpdate()}}/**
     * Requests an update which is processed asynchronously. This should
     * be called when an element should update based on some state not triggered
     * by setting a property. In this case, pass no arguments. It should also be
     * called when manually implementing a property setter. In this case, pass the
     * property `name` and `oldValue` to ensure that any configured property
     * options are honored. Returns the `updateComplete` Promise which is resolved
     * when the update completes.
     *
     * @param name {PropertyKey} (optional) name of requesting property
     * @param oldValue {any} (optional) old value of requesting property
     * @returns {Promise} A Promise that is resolved when the update completes.
     */requestUpdate(name,oldValue){this._requestUpdate(name,oldValue);return this.updateComplete}/**
     * Sets up the element to asynchronously update.
     */async _enqueueUpdate(){// Mark state updating...
this._updateState=this._updateState|STATE_UPDATE_REQUESTED;let resolve,reject;const previousUpdatePromise=this._updatePromise;this._updatePromise=new Promise((res,rej)=>{resolve=res;reject=rej});try{// Ensure any previous update has resolved before updating.
// This `await` also ensures that property changes are batched.
await previousUpdatePromise}catch(e){}// Ignore any previous errors. We only care that the previous cycle is
// done. Any error should have been handled in the previous update.
// Make sure the element has connected before updating.
if(!this._hasConnected){await new Promise(res=>this._hasConnectedResolver=res)}try{const result=this.performUpdate();// If `performUpdate` returns a Promise, we await it. This is done to
// enable coordinating updates with a scheduler. Note, the result is
// checked to avoid delaying an additional microtask unless we need to.
if(null!=result){await result}}catch(e){reject(e)}resolve(!this._hasRequestedUpdate)}get _hasConnected(){return this._updateState&STATE_HAS_CONNECTED}get _hasRequestedUpdate(){return this._updateState&STATE_UPDATE_REQUESTED}get hasUpdated(){return this._updateState&STATE_HAS_UPDATED}/**
     * Performs an element update. Note, if an exception is thrown during the
     * update, `firstUpdated` and `updated` will not be called.
     *
     * You can override this method to change the timing of updates. If this
     * method is overridden, `super.performUpdate()` must be called.
     *
     * For instance, to schedule updates to occur just before the next frame:
     *
     * ```
     * protected async performUpdate(): Promise<unknown> {
     *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
     *   super.performUpdate();
     * }
     * ```
     */performUpdate(){// Mixin instance properties once, if they exist.
if(this._instanceProperties){this._applyInstanceProperties()}let shouldUpdate=!1;const changedProperties=this._changedProperties;try{shouldUpdate=this.shouldUpdate(changedProperties);if(shouldUpdate){this.update(changedProperties)}}catch(e){// Prevent `firstUpdated` and `updated` from running when there's an
// update exception.
shouldUpdate=!1;throw e}finally{// Ensure element can accept additional updates after an exception.
this._markUpdated()}if(shouldUpdate){if(!(this._updateState&STATE_HAS_UPDATED)){this._updateState=this._updateState|STATE_HAS_UPDATED;this.firstUpdated(changedProperties)}this.updated(changedProperties)}}_markUpdated(){this._changedProperties=new Map;this._updateState=this._updateState&~STATE_UPDATE_REQUESTED}/**
     * Returns a Promise that resolves when the element has completed updating.
     * The Promise value is a boolean that is `true` if the element completed the
     * update without triggering another update. The Promise result is `false` if
     * a property was set inside `updated()`. If the Promise is rejected, an
     * exception was thrown during the update. This getter can be implemented to
     * await additional state. For example, it is sometimes useful to await a
     * rendered element before fulfilling this Promise. To do this, first await
     * `super.updateComplete` then any subsequent state.
     *
     * @returns {Promise} The Promise returns a boolean that indicates if the
     * update resolved without triggering another update.
     */get updateComplete(){return this._updatePromise}/**
     * Controls whether or not `update` should be called when the element requests
     * an update. By default, this method always returns `true`, but this can be
     * customized to control when to update.
     *
     * * @param _changedProperties Map of changed properties with old values
     */shouldUpdate(_changedProperties){return!0}/**
     * Updates the element. This method reflects property values to attributes.
     * It can be overridden to render and keep updated element DOM.
     * Setting properties inside this method will *not* trigger
     * another update.
     *
     * * @param _changedProperties Map of changed properties with old values
     */update(_changedProperties){if(this._reflectingProperties!==void 0&&0<this._reflectingProperties.size){// Use forEach so this works even if for/of loops are compiled to for
// loops expecting arrays
this._reflectingProperties.forEach((v,k)=>this._propertyToAttribute(k,this[k],v));this._reflectingProperties=void 0}}/**
     * Invoked whenever the element is updated. Implement to perform
     * post-updating tasks via DOM APIs, for example, focusing an element.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * * @param _changedProperties Map of changed properties with old values
     */updated(_changedProperties){}/**
                                  * Invoked when the element is first updated. Implement to perform one time
                                  * work on the element after update.
                                  *
                                  * Setting properties inside this method will trigger the element to update
                                  * again after this update cycle completes.
                                  *
                                  * * @param _changedProperties Map of changed properties with old values
                                  */firstUpdated(_changedProperties){}}/**
   * Marks class as having finished creating properties.
   */UpdatingElement.finalized=!0;var updatingElement={defaultConverter:defaultConverter,notEqual:notEqual,UpdatingElement:UpdatingElement};/**
    * @license
    * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */const directives=new WeakMap,directive=f=>(...args)=>{const d=f(...args);directives.set(d,!0);return d},isDirective=o=>{return"function"===typeof o&&directives.has(o)};/**
                                   * Brands a function as a directive factory function so that lit-html will call
                                   * the function during template rendering, rather than passing as a value.
                                   *
                                   * A _directive_ is a function that takes a Part as an argument. It has the
                                   * signature: `(part: Part) => void`.
                                   *
                                   * A directive _factory_ is a function that takes arguments for data and
                                   * configuration and returns a directive. Users of directive usually refer to
                                   * the directive factory as the directive. For example, "The repeat directive".
                                   *
                                   * Usually a template author will invoke a directive factory in their template
                                   * with relevant arguments, which will then return a directive function.
                                   *
                                   * Here's an example of using the `repeat()` directive factory that takes an
                                   * array and a function to render an item:
                                   *
                                   * ```js
                                   * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
                                   * ```
                                   *
                                   * When `repeat` is invoked, it returns a directive function that closes over
                                   * `items` and the template function. When the outer template is rendered, the
                                   * return directive function is called with the Part for the expression.
                                   * `repeat` then performs it's custom logic to render multiple items.
                                   *
                                   * @param f The directive factory function. Must be a function that returns a
                                   * function of the signature `(part: Part) => void`. The returned function will
                                   * be called with the part object.
                                   *
                                   * @example
                                   *
                                   * import {directive, html} from 'lit-html';
                                   *
                                   * const immutable = directive((v) => (part) => {
                                   *   if (part.value !== v) {
                                   *     part.setValue(v)
                                   *   }
                                   * });
                                   */var directive$1={directive:directive,isDirective:isDirective};/**
    * @license
    * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */ /**
        * True if the custom elements polyfill is in use.
        */const isCEPolyfill=window.customElements!==void 0&&window.customElements.polyfillWrapFlushCallback!==void 0,reparentNodes=(container,start,end=null,before=null)=>{while(start!==end){const n=start.nextSibling;container.insertBefore(start,before);start=n}},removeNodes=(container,start,end=null)=>{while(start!==end){const n=start.nextSibling;container.removeChild(start);start=n}};/**
                                                                                                                                   * Reparents nodes, starting from `start` (inclusive) to `end` (exclusive),
                                                                                                                                   * into another container (could be the same container), before `before`. If
                                                                                                                                   * `before` is null, it appends the nodes to the container.
                                                                                                                                   */var dom={isCEPolyfill:isCEPolyfill,reparentNodes:reparentNodes,removeNodes:removeNodes};/**
    * @license
    * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */ /**
        * A sentinel value that signals that a value was handled by a directive and
        * should not be written to the DOM.
        */const noChange={},nothing={};/**
                             * A sentinel value that signals a NodePart to fully clear its content.
                             */var part={noChange:noChange,nothing:nothing};/**
    * @license
    * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */ /**
        * An expression marker with embedded unique key to avoid collision with
        * possible text in templates.
        */const marker=`{{lit-${(Math.random()+"").slice(2)}}}`,nodeMarker=`<!--${marker}-->`,markerRegex=new RegExp(`${marker}|${nodeMarker}`),boundAttributeSuffix="$lit$";/**
                                                                    * An expression marker used text-positions, multi-binding attributes, and
                                                                    * attributes with markup-like text values.
                                                                    */ /**
                                              * An updateable Template that tracks the location of dynamic parts.
                                              */class Template{constructor(result,element){this.parts=[];this.element=element;const nodesToRemove=[],stack=[],walker=document.createTreeWalker(element.content,133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */,null,!1);// Keeps track of the last index associated with a part. We try to delete
// unnecessary nodes, but we never want to associate two different parts
// to the same index. They must have a constant node between.
let lastPartIndex=0,index=-1,partIndex=0;const{strings,values:{length}}=result;while(partIndex<length){const node=walker.nextNode();if(null===node){// We've exhausted the content inside a nested template element.
// Because we still have parts (the outer for-loop), we know:
// - There is a template in the stack
// - The walker will find a nextNode outside the template
walker.currentNode=stack.pop();continue}index++;if(1===node.nodeType/* Node.ELEMENT_NODE */){if(node.hasAttributes()){const attributes=node.attributes,{length}=attributes;// Per
// https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
// attributes are not guaranteed to be returned in document order.
// In particular, Edge/IE can return them out of order, so we cannot
// assume a correspondence between part index and attribute index.
let count=0;for(let i=0;i<length;i++){if(endsWith(attributes[i].name,boundAttributeSuffix)){count++}}while(0<count--){// Get the template literal section leading up to the first
// expression in this attribute
const stringForPart=strings[partIndex],name=lastAttributeNameRegex.exec(stringForPart)[2],attributeLookupName=name.toLowerCase()+boundAttributeSuffix,attributeValue=node.getAttribute(attributeLookupName);// Find the attribute name
node.removeAttribute(attributeLookupName);const statics=attributeValue.split(markerRegex);this.parts.push({type:"attribute",index,name,strings:statics});partIndex+=statics.length-1}}if("TEMPLATE"===node.tagName){stack.push(node);walker.currentNode=node.content}}else if(3===node.nodeType/* Node.TEXT_NODE */){const data=node.data;if(0<=data.indexOf(marker)){const parent=node.parentNode,strings=data.split(markerRegex),lastIndex=strings.length-1;// Generate a new text node for each literal section
// These nodes are also used as the markers for node parts
for(let i=0;i<lastIndex;i++){let insert,s=strings[i];if(""===s){insert=createMarker()}else{const match=lastAttributeNameRegex.exec(s);if(null!==match&&endsWith(match[2],boundAttributeSuffix)){s=s.slice(0,match.index)+match[1]+match[2].slice(0,-boundAttributeSuffix.length)+match[3]}insert=document.createTextNode(s)}parent.insertBefore(insert,node);this.parts.push({type:"node",index:++index})}// If there's no text, we must insert a comment to mark our place.
// Else, we can trust it will stick around after cloning.
if(""===strings[lastIndex]){parent.insertBefore(createMarker(),node);nodesToRemove.push(node)}else{node.data=strings[lastIndex]}// We have a part for each match found
partIndex+=lastIndex}}else if(8===node.nodeType/* Node.COMMENT_NODE */){if(node.data===marker){const parent=node.parentNode;// Add a new marker node to be the startNode of the Part if any of
// the following are true:
//  * We don't have a previousSibling
//  * The previousSibling is already the start of a previous part
if(null===node.previousSibling||index===lastPartIndex){index++;parent.insertBefore(createMarker(),node)}lastPartIndex=index;this.parts.push({type:"node",index});// If we don't have a nextSibling, keep this node so we have an end.
// Else, we can remove it to save future costs.
if(null===node.nextSibling){node.data=""}else{nodesToRemove.push(node);index--}partIndex++}else{let i=-1;while(-1!==(i=node.data.indexOf(marker,i+1))){// Comment node has a binding marker inside, make an inactive part
// The binding won't work, but subsequent bindings will
// TODO (justinfagnani): consider whether it's even worth it to
// make bindings in comments work
this.parts.push({type:"node",index:-1});partIndex++}}}}// Remove text binding nodes after the walk to not disturb the TreeWalker
for(const n of nodesToRemove){n.parentNode.removeChild(n)}}}const endsWith=(str,suffix)=>{const index=str.length-suffix.length;return 0<=index&&str.slice(index)===suffix},isTemplatePartActive=part=>-1!==part.index,createMarker=()=>document.createComment(""),lastAttributeNameRegex=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;var template={marker:marker,nodeMarker:nodeMarker,markerRegex:markerRegex,boundAttributeSuffix:boundAttributeSuffix,Template:Template,isTemplatePartActive:isTemplatePartActive,createMarker:createMarker,lastAttributeNameRegex:lastAttributeNameRegex};class TemplateInstance{constructor(template,processor,options){this.__parts=[];this.template=template;this.processor=processor;this.options=options}update(values){let i=0;for(const part of this.__parts){if(part!==void 0){part.setValue(values[i])}i++}for(const part of this.__parts){if(part!==void 0){part.commit()}}}_clone(){// There are a number of steps in the lifecycle of a template instance's
// DOM fragment:
//  1. Clone - create the instance fragment
//  2. Adopt - adopt into the main document
//  3. Process - find part markers and create parts
//  4. Upgrade - upgrade custom elements
//  5. Update - set node, attribute, property, etc., values
//  6. Connect - connect to the document. Optional and outside of this
//     method.
//
// We have a few constraints on the ordering of these steps:
//  * We need to upgrade before updating, so that property values will pass
//    through any property setters.
//  * We would like to process before upgrading so that we're sure that the
//    cloned fragment is inert and not disturbed by self-modifying DOM.
//  * We want custom elements to upgrade even in disconnected fragments.
//
// Given these constraints, with full custom elements support we would
// prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
//
// But Safari dooes not implement CustomElementRegistry#upgrade, so we
// can not implement that order and still have upgrade-before-update and
// upgrade disconnected fragments. So we instead sacrifice the
// process-before-upgrade constraint, since in Custom Elements v1 elements
// must not modify their light DOM in the constructor. We still have issues
// when co-existing with CEv0 elements like Polymer 1, and with polyfills
// that don't strictly adhere to the no-modification rule because shadow
// DOM, which may be created in the constructor, is emulated by being placed
// in the light DOM.
//
// The resulting order is on native is: Clone, Adopt, Upgrade, Process,
// Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
// in one step.
//
// The Custom Elements v1 polyfill supports upgrade(), so the order when
// polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
// Connect.
const fragment=isCEPolyfill?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),stack=[],parts=this.template.parts,walker=document.createTreeWalker(fragment,133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */,null,!1);let partIndex=0,nodeIndex=0,part,node=walker.nextNode();// Loop through all the nodes and parts of a template
while(partIndex<parts.length){part=parts[partIndex];if(!isTemplatePartActive(part)){this.__parts.push(void 0);partIndex++;continue}// Progress the tree walker until we find our next part's node.
// Note that multiple parts may share the same node (attribute parts
// on a single element), so this loop may not run at all.
while(nodeIndex<part.index){nodeIndex++;if("TEMPLATE"===node.nodeName){stack.push(node);walker.currentNode=node.content}if(null===(node=walker.nextNode())){// We've exhausted the content inside a nested template element.
// Because we still have parts (the outer for-loop), we know:
// - There is a template in the stack
// - The walker will find a nextNode outside the template
walker.currentNode=stack.pop();node=walker.nextNode()}}// We've arrived at our part's node.
if("node"===part.type){const part=this.processor.handleTextExpression(this.options);part.insertAfterNode(node.previousSibling);this.__parts.push(part)}else{this.__parts.push(...this.processor.handleAttributeExpressions(node,part.name,part.strings,this.options))}partIndex++}if(isCEPolyfill){document.adoptNode(fragment);customElements.upgrade(fragment)}return fragment}}var templateInstance={TemplateInstance:TemplateInstance};class TemplateResult{constructor(strings,values,type,processor){this.strings=strings;this.values=values;this.type=type;this.processor=processor}/**
     * Returns a string of HTML used to create a `<template>` element.
     */getHTML(){const l=this.strings.length-1;let html="",isCommentBinding=!1;for(let i=0;i<l;i++){const s=this.strings[i],commentOpen=s.lastIndexOf("<!--");// For each binding we want to determine the kind of marker to insert
// into the template source before it's parsed by the browser's HTML
// parser. The marker type is based on whether the expression is in an
// attribute, text, or comment poisition.
//   * For node-position bindings we insert a comment with the marker
//     sentinel as its text content, like <!--{{lit-guid}}-->.
//   * For attribute bindings we insert just the marker sentinel for the
//     first binding, so that we support unquoted attribute bindings.
//     Subsequent bindings can use a comment marker because multi-binding
//     attributes must be quoted.
//   * For comment bindings we insert just the marker sentinel so we don't
//     close the comment.
//
// The following code scans the template source, but is *not* an HTML
// parser. We don't need to track the tree structure of the HTML, only
// whether a binding is inside a comment, and if not, if it appears to be
// the first binding in an attribute.
// We're in comment position if we have a comment open with no following
// comment close. Because <-- can appear in an attribute value there can
// be false positives.
isCommentBinding=(-1<commentOpen||isCommentBinding)&&-1===s.indexOf("-->",commentOpen+1);// Check to see if we have an attribute-like sequence preceeding the
// expression. This can match "name=value" like structures in text,
// comments, and attribute values, so there can be false-positives.
const attributeMatch=lastAttributeNameRegex.exec(s);if(null===attributeMatch){// We're only in this branch if we don't have a attribute-like
// preceeding sequence. For comments, this guards against unusual
// attribute values like <div foo="<!--${'bar'}">. Cases like
// <!-- foo=${'bar'}--> are handled correctly in the attribute branch
// below.
html+=s+(isCommentBinding?marker:nodeMarker)}else{// For attributes we use just a marker sentinel, and also append a
// $lit$ suffix to the name to opt-out of attribute-specific parsing
// that IE and Edge do for style and certain SVG attributes.
html+=s.substr(0,attributeMatch.index)+attributeMatch[1]+attributeMatch[2]+boundAttributeSuffix+attributeMatch[3]+marker}}html+=this.strings[l];return html}getTemplateElement(){const template=document.createElement("template");template.innerHTML=this.getHTML();return template}}/**
   * A TemplateResult for SVG fragments.
   *
   * This class wraps HTML in an `<svg>` tag in order to parse its contents in the
   * SVG namespace, then modifies the template to remove the `<svg>` tag so that
   * clones only container the original fragment.
   */class SVGTemplateResult extends TemplateResult{getHTML(){return`<svg>${super.getHTML()}</svg>`}getTemplateElement(){const template=super.getTemplateElement(),content=template.content,svgElement=content.firstChild;content.removeChild(svgElement);reparentNodes(content,svgElement.firstChild);return template}}var templateResult={TemplateResult:TemplateResult,SVGTemplateResult:SVGTemplateResult};const isPrimitive=value=>{return null===value||!("object"===typeof value||"function"===typeof value)},isIterable=value=>{return Array.isArray(value)||// tslint:disable-next-line:no-any
!!(value&&value[Symbol.iterator])};/**
    * Writes attribute values to the DOM for a group of AttributeParts bound to a
    * single attibute. The value is only set once even if there are multiple parts
    * for an attribute.
    */class AttributeCommitter{constructor(element,name,strings){this.dirty=!0;this.element=element;this.name=name;this.strings=strings;this.parts=[];for(let i=0;i<strings.length-1;i++){this.parts[i]=this._createPart()}}/**
     * Creates a single part. Override this to create a differnt type of part.
     */_createPart(){return new AttributePart(this)}_getValue(){const strings=this.strings,l=strings.length-1;let text="";for(let i=0;i<l;i++){text+=strings[i];const part=this.parts[i];if(part!==void 0){const v=part.value;if(isPrimitive(v)||!isIterable(v)){text+="string"===typeof v?v:v+""}else{for(const t of v){text+="string"===typeof t?t:t+""}}}}text+=strings[l];return text}commit(){if(this.dirty){this.dirty=!1;this.element.setAttribute(this.name,this._getValue())}}}/**
   * A Part that controls all or part of an attribute value.
   */class AttributePart{constructor(committer){this.value=void 0;this.committer=committer}setValue(value){if(value!==noChange&&(!isPrimitive(value)||value!==this.value)){this.value=value;// If the value is a not a directive, dirty the committer so that it'll
// call setAttribute. If the value is a directive, it'll dirty the
// committer if it calls setValue().
if(!isDirective(value)){this.committer.dirty=!0}}}commit(){while(isDirective(this.value)){const directive=this.value;this.value=noChange;directive(this)}if(this.value===noChange){return}this.committer.commit()}}/**
   * A Part that controls a location within a Node tree. Like a Range, NodePart
   * has start and end locations and can set and update the Nodes between those
   * locations.
   *
   * NodeParts support several value types: primitives, Nodes, TemplateResults,
   * as well as arrays and iterables of those types.
   */class NodePart{constructor(options){this.value=void 0;this.__pendingValue=void 0;this.options=options}/**
     * Appends this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */appendInto(container){this.startNode=container.appendChild(createMarker());this.endNode=container.appendChild(createMarker())}/**
     * Inserts this part after the `ref` node (between `ref` and `ref`'s next
     * sibling). Both `ref` and its next sibling must be static, unchanging nodes
     * such as those that appear in a literal section of a template.
     *
     * This part must be empty, as its contents are not automatically moved.
     */insertAfterNode(ref){this.startNode=ref;this.endNode=ref.nextSibling}/**
     * Appends this part into a parent part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */appendIntoPart(part){part.__insert(this.startNode=createMarker());part.__insert(this.endNode=createMarker())}/**
     * Inserts this part after the `ref` part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */insertAfterPart(ref){ref.__insert(this.startNode=createMarker());this.endNode=ref.endNode;ref.endNode=this.startNode}setValue(value){this.__pendingValue=value}commit(){while(isDirective(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange;directive(this)}const value=this.__pendingValue;if(value===noChange){return}if(isPrimitive(value)){if(value!==this.value){this.__commitText(value)}}else if(value instanceof TemplateResult){this.__commitTemplateResult(value)}else if(value instanceof Node){this.__commitNode(value)}else if(isIterable(value)){this.__commitIterable(value)}else if(value===nothing){this.value=nothing;this.clear()}else{// Fallback, will render the string representation
this.__commitText(value)}}__insert(node){this.endNode.parentNode.insertBefore(node,this.endNode)}__commitNode(value){if(this.value===value){return}this.clear();this.__insert(value);this.value=value}__commitText(value){const node=this.startNode.nextSibling;value=null==value?"":value;if(node===this.endNode.previousSibling&&3===node.nodeType/* Node.TEXT_NODE */){// If we only have a single text node between the markers, we can just
// set its value, rather than replacing it.
// TODO(justinfagnani): Can we just check if this.value is primitive?
node.data=value}else{this.__commitNode(document.createTextNode("string"===typeof value?value:value+""))}this.value=value}__commitTemplateResult(value){const template=this.options.templateFactory(value);if(this.value instanceof TemplateInstance&&this.value.template===template){this.value.update(value.values)}else{// Make sure we propagate the template processor from the TemplateResult
// so that we use its syntax extension, etc. The template factory comes
// from the render function options so that it can control template
// caching and preprocessing.
const instance=new TemplateInstance(template,value.processor,this.options),fragment=instance._clone();instance.update(value.values);this.__commitNode(fragment);this.value=instance}}__commitIterable(value){// For an Iterable, we create a new InstancePart per item, then set its
// value to the item. This is a little bit of overhead for every item in
// an Iterable, but it lets us recurse easily and efficiently update Arrays
// of TemplateResults that will be commonly returned from expressions like:
// array.map((i) => html`${i}`), by reusing existing TemplateInstances.
// If _value is an array, then the previous render was of an
// iterable and _value will contain the NodeParts from the previous
// render. If _value is not an array, clear this part and make a new
// array for NodeParts.
if(!Array.isArray(this.value)){this.value=[];this.clear()}// Lets us keep track of how many items we stamped so we can clear leftover
// items from a previous render
const itemParts=this.value;let partIndex=0,itemPart;for(const item of value){// Try to reuse an existing part
itemPart=itemParts[partIndex];// If no existing part, create a new one
if(itemPart===void 0){itemPart=new NodePart(this.options);itemParts.push(itemPart);if(0===partIndex){itemPart.appendIntoPart(this)}else{itemPart.insertAfterPart(itemParts[partIndex-1])}}itemPart.setValue(item);itemPart.commit();partIndex++}if(partIndex<itemParts.length){// Truncate the parts array so _value reflects the current state
itemParts.length=partIndex;this.clear(itemPart&&itemPart.endNode)}}clear(startNode=this.startNode){removeNodes(this.startNode.parentNode,startNode.nextSibling,this.endNode)}}/**
   * Implements a boolean attribute, roughly as defined in the HTML
   * specification.
   *
   * If the value is truthy, then the attribute is present with a value of
   * ''. If the value is falsey, the attribute is removed.
   */class BooleanAttributePart{constructor(element,name,strings){this.value=void 0;this.__pendingValue=void 0;if(2!==strings.length||""!==strings[0]||""!==strings[1]){throw new Error("Boolean attributes can only contain a single expression")}this.element=element;this.name=name;this.strings=strings}setValue(value){this.__pendingValue=value}commit(){while(isDirective(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange;directive(this)}if(this.__pendingValue===noChange){return}const value=!!this.__pendingValue;if(this.value!==value){if(value){this.element.setAttribute(this.name,"")}else{this.element.removeAttribute(this.name)}this.value=value}this.__pendingValue=noChange}}/**
   * Sets attribute values for PropertyParts, so that the value is only set once
   * even if there are multiple parts for a property.
   *
   * If an expression controls the whole property value, then the value is simply
   * assigned to the property under control. If there are string literals or
   * multiple expressions, then the strings are expressions are interpolated into
   * a string first.
   */class PropertyCommitter extends AttributeCommitter{constructor(element,name,strings){super(element,name,strings);this.single=2===strings.length&&""===strings[0]&&""===strings[1]}_createPart(){return new PropertyPart(this)}_getValue(){if(this.single){return this.parts[0].value}return super._getValue()}commit(){if(this.dirty){this.dirty=!1;// tslint:disable-next-line:no-any
this.element[this.name]=this._getValue()}}}class PropertyPart extends AttributePart{}// Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the thrid
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.
let eventOptionsSupported=!1;try{const options={get capture(){eventOptionsSupported=!0;return!1}};// tslint:disable-next-line:no-any
window.addEventListener("test",options,options);// tslint:disable-next-line:no-any
window.removeEventListener("test",options,options)}catch(_e){}class EventPart{constructor(element,eventName,eventContext){this.value=void 0;this.__pendingValue=void 0;this.element=element;this.eventName=eventName;this.eventContext=eventContext;this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(value){this.__pendingValue=value}commit(){while(isDirective(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange;directive(this)}if(this.__pendingValue===noChange){return}const newListener=this.__pendingValue,oldListener=this.value,shouldRemoveListener=null==newListener||null!=oldListener&&(newListener.capture!==oldListener.capture||newListener.once!==oldListener.once||newListener.passive!==oldListener.passive),shouldAddListener=null!=newListener&&(null==oldListener||shouldRemoveListener);if(shouldRemoveListener){this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options)}if(shouldAddListener){this.__options=getOptions(newListener);this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)}this.value=newListener;this.__pendingValue=noChange}handleEvent(event){if("function"===typeof this.value){this.value.call(this.eventContext||this.element,event)}else{this.value.handleEvent(event)}}}// We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.
const getOptions=o=>o&&(eventOptionsSupported?{capture:o.capture,passive:o.passive,once:o.once}:o.capture);var parts={isPrimitive:isPrimitive,isIterable:isIterable,AttributeCommitter:AttributeCommitter,AttributePart:AttributePart,NodePart:NodePart,BooleanAttributePart:BooleanAttributePart,PropertyCommitter:PropertyCommitter,PropertyPart:PropertyPart,EventPart:EventPart};class DefaultTemplateProcessor{/**
   * Create parts for an attribute-position binding, given the event, attribute
   * name, and string literals.
   *
   * @param element The element containing the binding
   * @param name  The attribute name
   * @param strings The string literals. There are always at least two strings,
   *   event for fully-controlled bindings with a single expression.
   */handleAttributeExpressions(element,name,strings,options){const prefix=name[0];if("."===prefix){const committer=new PropertyCommitter(element,name.slice(1),strings);return committer.parts}if("@"===prefix){return[new EventPart(element,name.slice(1),options.eventContext)]}if("?"===prefix){return[new BooleanAttributePart(element,name.slice(1),strings)]}const committer=new AttributeCommitter(element,name,strings);return committer.parts}/**
     * Create parts for a text-position binding.
     * @param templateFactory
     */handleTextExpression(options){return new NodePart(options)}}const defaultTemplateProcessor=new DefaultTemplateProcessor;var defaultTemplateProcessor$1={DefaultTemplateProcessor:DefaultTemplateProcessor,defaultTemplateProcessor:defaultTemplateProcessor};function templateFactory(result){let templateCache=templateCaches.get(result.type);if(templateCache===void 0){templateCache={stringsArray:new WeakMap,keyString:new Map};templateCaches.set(result.type,templateCache)}let template=templateCache.stringsArray.get(result.strings);if(template!==void 0){return template}// If the TemplateStringsArray is new, generate a key from the strings
// This key is shared between all templates with identical content
const key=result.strings.join(marker);// Check if we already have a Template for this key
template=templateCache.keyString.get(key);if(template===void 0){// If we have not seen this key before, create a new Template
template=new Template(result,result.getTemplateElement());// Cache the Template for this key
templateCache.keyString.set(key,template)}// Cache all future queries for this TemplateStringsArray
templateCache.stringsArray.set(result.strings,template);return template}const templateCaches=new Map;var templateFactory$1={templateFactory:templateFactory,templateCaches:templateCaches};const parts$1=new WeakMap,render=(result,container,options)=>{let part=parts$1.get(container);if(part===void 0){removeNodes(container,container.firstChild);parts$1.set(container,part=new NodePart(Object.assign({templateFactory},options)));part.appendInto(container)}part.setValue(result);part.commit()};/**
                                     * Renders a template to a container.
                                     *
                                     * To update a container with new values, reevaluate the template literal and
                                     * call `render` with the new result.
                                     *
                                     * @param result a TemplateResult created by evaluating a template tag like
                                     *     `html` or `svg`.
                                     * @param container A DOM parent to render to. The entire contents are either
                                     *     replaced, or efficiently updated if the same result type was previous
                                     *     rendered there.
                                     * @param options RenderOptions for the entire render tree rendered to this
                                     *     container. Render options must *not* change between renders to the same
                                     *     container, as those changes will not effect previously rendered DOM.
                                     */var render$1={parts:parts$1,render:render};// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time
(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.0.0");/**
                                                                                * Interprets a template literal as an HTML template that can efficiently
                                                                                * render to and update a container.
                                                                                */const html=(strings,...values)=>new TemplateResult(strings,values,"html",defaultTemplateProcessor),svg=(strings,...values)=>new SVGTemplateResult(strings,values,"svg",defaultTemplateProcessor);/**
                                                                                                                    * Interprets a template literal as an SVG template that can efficiently
                                                                                                                    * render to and update a container.
                                                                                                                    */var litHtml={html:html,svg:svg,DefaultTemplateProcessor:DefaultTemplateProcessor,defaultTemplateProcessor:defaultTemplateProcessor,directive:directive,isDirective:isDirective,removeNodes:removeNodes,reparentNodes:reparentNodes,noChange:noChange,nothing:nothing,AttributeCommitter:AttributeCommitter,AttributePart:AttributePart,BooleanAttributePart:BooleanAttributePart,EventPart:EventPart,isIterable:isIterable,isPrimitive:isPrimitive,NodePart:NodePart,PropertyCommitter:PropertyCommitter,PropertyPart:PropertyPart,parts:parts$1,render:render,templateCaches:templateCaches,templateFactory:templateFactory,TemplateInstance:TemplateInstance,SVGTemplateResult:SVGTemplateResult,TemplateResult:TemplateResult,createMarker:createMarker,isTemplatePartActive:isTemplatePartActive,Template:Template};const walkerNodeFilter=133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */;/**
                                                                            * Removes the list of nodes from a Template safely. In addition to removing
                                                                            * nodes from the Template, the Template part indices are updated to match
                                                                            * the mutated Template DOM.
                                                                            *
                                                                            * As the template is walked the removal state is tracked and
                                                                            * part indices are adjusted as needed.
                                                                            *
                                                                            * div
                                                                            *   div#1 (remove) <-- start removing (removing node is div#1)
                                                                            *     div
                                                                            *       div#2 (remove)  <-- continue removing (removing node is still div#1)
                                                                            *         div
                                                                            * div <-- stop removing since previous sibling is the removing node (div#1,
                                                                            * removed 4 nodes)
                                                                            */function removeNodesFromTemplate(template,nodesToRemove){const{element:{content},parts}=template,walker=document.createTreeWalker(content,walkerNodeFilter,null,!1);let partIndex=nextActiveIndexInTemplateParts(parts),part=parts[partIndex],nodeIndex=-1,removeCount=0;const nodesToRemoveInTemplate=[];let currentRemovingNode=null;while(walker.nextNode()){nodeIndex++;const node=walker.currentNode;// End removal if stepped past the removing node
if(node.previousSibling===currentRemovingNode){currentRemovingNode=null}// A node to remove was found in the template
if(nodesToRemove.has(node)){nodesToRemoveInTemplate.push(node);// Track node we're removing
if(null===currentRemovingNode){currentRemovingNode=node}}// When removing, increment count by which to adjust subsequent part indices
if(null!==currentRemovingNode){removeCount++}while(part!==void 0&&part.index===nodeIndex){// If part is in a removed node deactivate it by setting index to -1 or
// adjust the index as needed.
part.index=null!==currentRemovingNode?-1:part.index-removeCount;// go to the next active part.
partIndex=nextActiveIndexInTemplateParts(parts,partIndex);part=parts[partIndex]}}nodesToRemoveInTemplate.forEach(n=>n.parentNode.removeChild(n))}const countNodes=node=>{let count=11===node.nodeType/* Node.DOCUMENT_FRAGMENT_NODE */?0:1;const walker=document.createTreeWalker(node,walkerNodeFilter,null,!1);while(walker.nextNode()){count++}return count},nextActiveIndexInTemplateParts=(parts,startIndex=-1)=>{for(let i=startIndex+1;i<parts.length;i++){const part=parts[i];if(isTemplatePartActive(part)){return i}}return-1};/**
    * Inserts the given node into the Template, optionally before the given
    * refNode. In addition to inserting the node into the Template, the Template
    * part indices are updated to match the mutated Template DOM.
    */function insertNodeIntoTemplate(template,node,refNode=null){const{element:{content},parts}=template;// If there's no refNode, then put node at end of template.
// No part indices need to be shifted in this case.
if(null===refNode||refNode===void 0){content.appendChild(node);return}const walker=document.createTreeWalker(content,walkerNodeFilter,null,!1);let partIndex=nextActiveIndexInTemplateParts(parts),insertCount=0,walkerIndex=-1;while(walker.nextNode()){walkerIndex++;const walkerNode=walker.currentNode;if(walkerNode===refNode){insertCount=countNodes(node);refNode.parentNode.insertBefore(node,refNode)}while(-1!==partIndex&&parts[partIndex].index===walkerIndex){// If we've inserted the node, simply adjust all subsequent parts
if(0<insertCount){while(-1!==partIndex){parts[partIndex].index+=insertCount;partIndex=nextActiveIndexInTemplateParts(parts,partIndex)}return}partIndex=nextActiveIndexInTemplateParts(parts,partIndex)}}}var modifyTemplate={removeNodesFromTemplate:removeNodesFromTemplate,insertNodeIntoTemplate:insertNodeIntoTemplate};const getTemplateCacheKey=(type,scopeName)=>`${type}--${scopeName}`;let compatibleShadyCSSVersion=!0;if("undefined"===typeof window.ShadyCSS){compatibleShadyCSSVersion=!1}else if("undefined"===typeof window.ShadyCSS.prepareTemplateDom){console.warn(`Incompatible ShadyCSS version detected. `+`Please update to at least @webcomponents/webcomponentsjs@2.0.2 and `+`@webcomponents/shadycss@1.3.1.`);compatibleShadyCSSVersion=!1}/**
   * Template factory which scopes template DOM using ShadyCSS.
   * @param scopeName {string}
   */const shadyTemplateFactory=scopeName=>result=>{const cacheKey=getTemplateCacheKey(result.type,scopeName);let templateCache=templateCaches.get(cacheKey);if(templateCache===void 0){templateCache={stringsArray:new WeakMap,keyString:new Map};templateCaches.set(cacheKey,templateCache)}let template=templateCache.stringsArray.get(result.strings);if(template!==void 0){return template}const key=result.strings.join(marker);template=templateCache.keyString.get(key);if(template===void 0){const element=result.getTemplateElement();if(compatibleShadyCSSVersion){window.ShadyCSS.prepareTemplateDom(element,scopeName)}template=new Template(result,element);templateCache.keyString.set(key,template)}templateCache.stringsArray.set(result.strings,template);return template},TEMPLATE_TYPES=["html","svg"],removeStylesFromLitTemplates=scopeName=>{TEMPLATE_TYPES.forEach(type=>{const templates=templateCaches.get(getTemplateCacheKey(type,scopeName));if(templates!==void 0){templates.keyString.forEach(template=>{const{element:{content}}=template,styles=new Set;// IE 11 doesn't support the iterable param Set constructor
Array.from(content.querySelectorAll("style")).forEach(s=>{styles.add(s)});removeNodesFromTemplate(template,styles)})}})},shadyRenderSet=new Set,prepareTemplateStyles=(renderedDOM,template,scopeName)=>{shadyRenderSet.add(scopeName);// Move styles out of rendered DOM and store.
const styles=renderedDOM.querySelectorAll("style"),{length}=styles;// If there are no styles, skip unnecessary work
if(0===length){// Ensure prepareTemplateStyles is called to support adding
// styles via `prepareAdoptedCssText` since that requires that
// `prepareTemplateStyles` is called.
window.ShadyCSS.prepareTemplateStyles(template.element,scopeName);return}const condensedStyle=document.createElement("style");// Collect styles into a single style. This helps us make sure ShadyCSS
// manipulations will not prevent us from being able to fix up template
// part indices.
// NOTE: collecting styles is inefficient for browsers but ShadyCSS
// currently does this anyway. When it does not, this should be changed.
for(let i=0;i<length;i++){const style=styles[i];style.parentNode.removeChild(style);condensedStyle.textContent+=style.textContent}// Remove styles from nested templates in this scope.
removeStylesFromLitTemplates(scopeName);// And then put the condensed style into the "root" template passed in as
// `template`.
const content=template.element.content;insertNodeIntoTemplate(template,condensedStyle,content.firstChild);// Note, it's important that ShadyCSS gets the template that `lit-html`
// will actually render so that it can update the style inside when
// needed (e.g. @apply native Shadow DOM case).
window.ShadyCSS.prepareTemplateStyles(template.element,scopeName);const style=content.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==style){// When in native Shadow DOM, ensure the style created by ShadyCSS is
// included in initially rendered output (`renderedDOM`).
renderedDOM.insertBefore(style.cloneNode(!0),renderedDOM.firstChild)}else{// When no style is left in the template, parts will be broken as a
// result. To fix this, we put back the style node ShadyCSS removed
// and then tell lit to remove that node from the template.
// There can be no style in the template in 2 cases (1) when Shady DOM
// is in use, ShadyCSS removes all styles, (2) when native Shadow DOM
// is in use ShadyCSS removes the style if it contains no content.
// NOTE, ShadyCSS creates its own style so we can safely add/remove
// `condensedStyle` here.
content.insertBefore(condensedStyle,content.firstChild);const removes=new Set([condensedStyle]);removeNodesFromTemplate(template,removes)}},render$2=(result,container,options)=>{const scopeName=options.scopeName,hasRendered=parts$1.has(container),needsScoping=compatibleShadyCSSVersion&&11===container.nodeType/* Node.DOCUMENT_FRAGMENT_NODE */&&!!container.host&&result instanceof TemplateResult,firstScopeRender=needsScoping&&!shadyRenderSet.has(scopeName),renderContainer=firstScopeRender?document.createDocumentFragment():container;render(result,renderContainer,Object.assign({templateFactory:shadyTemplateFactory(scopeName)},options));// When performing first scope render,
// (1) We've rendered into a fragment so that there's a chance to
// `prepareTemplateStyles` before sub-elements hit the DOM
// (which might cause them to render based on a common pattern of
// rendering in a custom element's `connectedCallback`);
// (2) Scope the template with ShadyCSS one time only for this scope.
// (3) Render the fragment into the container and make sure the
// container knows its `part` is the one we just rendered. This ensures
// DOM will be re-used on subsequent renders.
if(firstScopeRender){const part=parts$1.get(renderContainer);parts$1.delete(renderContainer);if(part.value instanceof TemplateInstance){prepareTemplateStyles(renderContainer,part.value.template,scopeName)}removeNodes(container,container.firstChild);container.appendChild(renderContainer);parts$1.set(container,part)}// After elements have hit the DOM, update styling if this is the
// initial render to this container.
// This is needed whenever dynamic changes are made so it would be
// safest to do every render; however, this would regress performance
// so we leave it up to the user to call `ShadyCSSS.styleElement`
// for dynamic changes.
if(!hasRendered&&needsScoping){window.ShadyCSS.styleElement(container.host)}};var shadyRender={render:render$2,html:html,svg:svg,TemplateResult:TemplateResult};// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for LitElement usage.
// TODO(justinfagnani): inject version number at build time
(window.litElementVersions||(window.litElementVersions=[])).push("2.2.0");/**
                                                                                      * Minimal implementation of Array.prototype.flat
                                                                                      * @param arr the array to flatten
                                                                                      * @param result the accumlated result
                                                                                      */function arrayFlat(styles,result=[]){for(let i=0,length=styles.length;i<length;i++){const value=styles[i];if(Array.isArray(value)){arrayFlat(value,result)}else{result.push(value)}}return result}/** Deeply flattens styles array. Uses native flat if available. */const flattenStyles=styles=>styles.flat?styles.flat(1/0):arrayFlat(styles);class LitElement extends UpdatingElement{/** @nocollapse */static finalize(){super.finalize();// Prepare styling that is stamped at first render time. Styling
// is built from user provided `styles` or is inherited from the superclass.
this._styles=this.hasOwnProperty(JSCompiler_renameProperty("styles",this))?this._getUniqueStyles():this._styles||[]}/** @nocollapse */static _getUniqueStyles(){// Take care not to call `this.styles` multiple times since this generates
// new CSSResults each time.
// TODO(sorvell): Since we do not cache CSSResults by input, any
// shared styles will generate new stylesheet objects, which is wasteful.
// This should be addressed when a browser ships constructable
// stylesheets.
const userStyles=this.styles,styles=[];if(Array.isArray(userStyles)){const flatStyles=flattenStyles(userStyles),styleSet=flatStyles.reduceRight((set,s)=>{set.add(s);// on IE set.add does not return the set.
return set},new Set);// As a performance optimization to avoid duplicated styling that can
// occur especially when composing via subclassing, de-duplicate styles
// preserving the last item in the list. The last item is kept to
// try to preserve cascade order with the assumption that it's most
// important that last added styles override previous styles.
// Array.from does not work on Set in IE
styleSet.forEach(v=>styles.unshift(v))}else if(userStyles){styles.push(userStyles)}return styles}/**
     * Performs element initialization. By default this calls `createRenderRoot`
     * to create the element `renderRoot` node and captures any pre-set values for
     * registered properties.
     */initialize(){super.initialize();this.renderRoot=this.createRenderRoot();// Note, if renderRoot is not a shadowRoot, styles would/could apply to the
// element's getRootNode(). While this could be done, we're choosing not to
// support this now since it would require different logic around de-duping.
if(window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot){this.adoptStyles()}}/**
     * Returns the node into which the element should render and by default
     * creates and returns an open shadowRoot. Implement to customize where the
     * element's DOM is rendered. For example, to render into the element's
     * childNodes, return `this`.
     * @returns {Element|DocumentFragment} Returns a node into which to render.
     */createRenderRoot(){return this.attachShadow({mode:"open"})}/**
     * Applies styling to the element shadowRoot using the `static get styles`
     * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
     * available and will fallback otherwise. When Shadow DOM is polyfilled,
     * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
     * is available but `adoptedStyleSheets` is not, styles are appended to the
     * end of the `shadowRoot` to [mimic spec
     * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
     */adoptStyles(){const styles=this.constructor._styles;if(0===styles.length){return}// There are three separate cases here based on Shadow DOM support.
// (1) shadowRoot polyfilled: use ShadyCSS
// (2) shadowRoot.adoptedStyleSheets available: use it.
// (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
// rendering
if(window.ShadyCSS!==void 0&&!window.ShadyCSS.nativeShadow){window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map(s=>s.cssText),this.localName)}else if(supportsAdoptingStyleSheets){this.renderRoot.adoptedStyleSheets=styles.map(s=>s.styleSheet)}else{// This must be done after rendering so the actual style insertion is done
// in `update`.
this._needsShimAdoptedStyleSheets=!0}}connectedCallback(){super.connectedCallback();// Note, first update/render handles styleElement so we only call this if
// connected after first update.
if(this.hasUpdated&&window.ShadyCSS!==void 0){window.ShadyCSS.styleElement(this)}}/**
     * Updates the element. This method reflects property values to attributes
     * and calls `render` to render DOM via lit-html. Setting properties inside
     * this method will *not* trigger another update.
     * * @param _changedProperties Map of changed properties with old values
     */update(changedProperties){super.update(changedProperties);const templateResult=this.render();if(templateResult instanceof TemplateResult){this.constructor.render(templateResult,this.renderRoot,{scopeName:this.localName,eventContext:this})}// When native Shadow DOM is used but adoptedStyles are not supported,
// insert styling after rendering to ensure adoptedStyles have highest
// priority.
if(this._needsShimAdoptedStyleSheets){this._needsShimAdoptedStyleSheets=!1;this.constructor._styles.forEach(s=>{const style=document.createElement("style");style.textContent=s.cssText;this.renderRoot.appendChild(style)})}}/**
     * Invoked on each update to perform rendering tasks. This method must return
     * a lit-html TemplateResult. Setting properties inside this method will *not*
     * trigger the element to update.
     */render(){}}/**
   * Ensure this class is marked as `finalized` as an optimization ensuring
   * it will not needlessly try to `finalize`.
   */LitElement.finalized=!0;/**
                              * Render method used to render the lit-html TemplateResult to the element's
                              * DOM.
                              * @param {TemplateResult} Template to render.
                              * @param {Element|DocumentFragment} Node into which to render.
                              * @param {String} Element name.
                              * @nocollapse
                              */LitElement.render=render$2;var litElement={LitElement:LitElement,defaultConverter:defaultConverter,notEqual:notEqual,UpdatingElement:UpdatingElement,customElement:customElement,property:property,query:query,queryAll:queryAll,eventOptions:eventOptions,html:html,svg:svg,TemplateResult:TemplateResult,SVGTemplateResult:SVGTemplateResult,supportsAdoptingStyleSheets:supportsAdoptingStyleSheets,CSSResult:CSSResult,unsafeCSS:unsafeCSS,css:css},__decorate=void 0||function(decorators,target,key,desc){var c=arguments.length,r=3>c?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc,d;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;0<=i;i--)if(d=decorators[i])r=(3>c?d(r):3<c?d(target,key,r):d(target,key))||r;return 3<c&&r&&Object.defineProperty(target,key,r),r};let Pho3nixPopup=class Pho3nixPopup extends LitElement{constructor(){super(...arguments);this.title=""}static get styles(){return[css`
            @keyframes fade-in {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }
            
            @keyframes fade-out {
                0% {
                    opacity: 1;
                }
                99% {
                    opacity: 0;
                }
                100% {
                    opacity: 0;
                    visibility: hidden;
                    display: none;
                }
            }
            
            @keyframes slide-in-bottom {
                0% {
                    transform: translateY(1000px);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slide-out-bottom {
                0% {
                    transform: translateY(0);
                    opacity: 1;
                }
                100% {
                    transform: translateY(1000px);
                    opacity: 0;
                }
            }
            .fade-in {
                animation: fade-in 300ms cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
                animation-fill-mode: forwards;
            }
            .fade-out {
                animation: fade-out 300ms ease-out both;
                animation-fill-mode: forwards;
            }
            .slide-in-bottom {
                animation: slide-in-bottom 300ms cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                animation-fill-mode: forwards;
            }
            .slide-out-bottom {
                animation: slide-out-bottom 300ms cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
                animation-fill-mode: forwards;
            }
            .wrapper {
                position: absolute;
                top: 0px;
                left: 0px;
                right: 0px;
                bottom: 0px;
                background: var(--bg-color, rgba(0,0,0,0.85));
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                overflow: hidden;
            }

            .wrapper:not(.fade-out):not(.fade-in) {
                display: none;
            }

            .popup {
                min-width: 50%;
                background: var(--popup-bg-color, #fff);
                padding: 1em;
                cursor: auto;
                border-radius: .5em;
            }

            .headline {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }

            .headline h1 {
                margin: 0;
                font-size: 2em;
            }

            .headline a {
                font-size: 2em;
                cursor: pointer;
            }
            @media only screen and (max-width: 1280px) {
                .wrapper {
                    align-items: flex-end;
                    justify-items: stretch;
                    padding: 0em 1em;
                }
                .popup {
                    width: 100%;
                    border-radius: .5em .5em 0em 0em;
                }
            }
            `]}get wrapper(){return this.renderRoot&&this.renderRoot.querySelector(".wrapper")}get popup(){return this.renderRoot&&this.renderRoot.querySelector(".popup")}open(){this.show()}show(){const{wrapper,popup}=this;if(wrapper&&popup){wrapper.classList.remove("fade-out");popup.classList.remove("slide-out-bottom");wrapper.classList.add("fade-in");popup.classList.add("slide-in-bottom")}}hide(){const{wrapper,popup}=this;if(wrapper&&popup){wrapper.classList.remove("fade-in");popup.classList.remove("slide-in-bottom");wrapper.classList.add("fade-out");popup.classList.add("slide-out-bottom")}}close(event){if(event){event.stopPropagation();const action=event.target&&event.target.getAttribute("data-action");if("close"===action){this.hide();this.dispatchEvent(new Event("close"))}}else{this.hide();this.dispatchEvent(new Event("close"))}}render(){return html`
   <div data-action="close" class="wrapper" @click=${this.close}>
    <div class="popup">
      <div class="headline">
        <h1>${this.title}</h1>
        <a data-action="close" @click=${this.close}>×</a>
      </div>
      <slot></slot>
    </div>
   </div>
   `}};__decorate([property({type:String,reflect:!0,attribute:!0})],Pho3nixPopup.prototype,"title",void 0);Pho3nixPopup=__decorate([customElement("pho3nix-popup")],Pho3nixPopup);var pho3nixPopup={get Pho3nixPopup(){return Pho3nixPopup}};export{cssTag as $cssTag,decorators as $decorators,defaultTemplateProcessor$1 as $defaultTemplateProcessor,directive$1 as $directive,dom as $dom,litElement as $litElement,litHtml as $litHtml,modifyTemplate as $modifyTemplate,part as $part,parts as $parts,pho3nixPopup as $pho3nixPopup,render$1 as $render,shadyRender as $shadyRender,template as $template,templateFactory$1 as $templateFactory,templateInstance as $templateInstance,templateResult as $templateResult,updatingElement as $updatingElement,AttributeCommitter,AttributeCommitter as AttributeCommitter$1,AttributePart,AttributePart as AttributePart$1,BooleanAttributePart,BooleanAttributePart as BooleanAttributePart$1,CSSResult,CSSResult as CSSResult$1,DefaultTemplateProcessor,DefaultTemplateProcessor as DefaultTemplateProcessor$1,EventPart,EventPart as EventPart$1,LitElement,NodePart,NodePart as NodePart$1,Pho3nixPopup,PropertyCommitter,PropertyCommitter as PropertyCommitter$1,PropertyPart,PropertyPart as PropertyPart$1,SVGTemplateResult,SVGTemplateResult as SVGTemplateResult$1,SVGTemplateResult as SVGTemplateResult$2,Template,Template as Template$1,TemplateInstance,TemplateInstance as TemplateInstance$1,TemplateResult,TemplateResult as TemplateResult$1,TemplateResult as TemplateResult$2,TemplateResult as TemplateResult$3,UpdatingElement,UpdatingElement as UpdatingElement$1,boundAttributeSuffix,createMarker,createMarker as createMarker$1,css,css as css$1,customElement,customElement as customElement$1,defaultConverter,defaultConverter as defaultConverter$1,defaultTemplateProcessor,defaultTemplateProcessor as defaultTemplateProcessor$1,directive,directive as directive$1,eventOptions,eventOptions as eventOptions$1,html,html as html$1,html as html$2,insertNodeIntoTemplate,isCEPolyfill,isDirective,isDirective as isDirective$1,isIterable,isIterable as isIterable$1,isPrimitive,isPrimitive as isPrimitive$1,isTemplatePartActive,isTemplatePartActive as isTemplatePartActive$1,lastAttributeNameRegex,marker,markerRegex,noChange,noChange as noChange$1,nodeMarker,notEqual,notEqual as notEqual$1,nothing,nothing as nothing$1,parts$1 as parts,parts$1,property,property as property$1,query,query as query$1,queryAll,queryAll as queryAll$1,removeNodes,removeNodes as removeNodes$1,removeNodesFromTemplate,render,render$2 as render$1,render as render$2,reparentNodes,reparentNodes as reparentNodes$1,supportsAdoptingStyleSheets,supportsAdoptingStyleSheets as supportsAdoptingStyleSheets$1,svg,svg as svg$1,svg as svg$2,templateCaches,templateCaches as templateCaches$1,templateFactory,templateFactory as templateFactory$1,unsafeCSS,unsafeCSS as unsafeCSS$1};