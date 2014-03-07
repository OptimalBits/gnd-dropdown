
declare var _;

class SelectOption extends Gnd.Model
{}

/**
  This class is mainly used to break a circular dependency that affects the
  retain/release mechanism to work properly.
*/

class DropDownProxy extends Gnd.Base
{
  private dropdown: DropDown;
  
  constructor(dropdown: DropDown){
    super();
    
    this.dropdown = dropdown;
    
    this.bind('selectedId', dropdown);
    this.bind('selectedName', dropdown);
  }
  
  selectHandler(el)
  {
    var item = el['gnd-obj'];
    if(!item.disabled) {
      this.dropdown.selectItem(item);
      this.dropdown.deactivate();
    }
  }
}

// SelectOption.bucket()
// SelectOption.schema()
// SelectOption.decorate('selectOptions', schema)

class DropDown extends Gnd.View {
  private selectingId: string;
  private selectedId: string;
  private selectedItem: Gnd.Model;
  private viewModel: Gnd.ViewModel;
  private selectOptions: Gnd.Collection;
  private opts;
  private dropdownProxy: DropDownProxy;

  constructor(collection: Gnd.Collection, opts)
  {
    super({
      templateUrl: 'gnd/dropdown/dropdown.html.tmpl',
      templateEngine: _.template
    });
      
    this.opts = opts = _.defaults(opts || {}, {
      standard: true,
      nameKeyPath:'name'
    });
    
    this.dropdownProxy = new DropDownProxy(this);
      
    if(opts.selection){
      opts.selection.model.on(opts.selection.key, (id) => {
        this.selectById(id);
      });
      this.on('selectedId', function(id){
        opts.selection.model.set(opts.selection.key, id);
      });
    }

    var selectOptions = this.selectOptions = 
      new Gnd.Collection(SelectOption, {nosync: true});
        
    selectOptions.link(collection, function(evt, item: Gnd.Model, fields?){
      switch(evt){
        case 'added:':
          selectOptions.add(new SelectOption(
            {item: item, 
             name: item.get(opts.nameKeyPath),
             itemId: item.id()}));
          break;
        case 'removed:':
          var opt = selectOptions['find']({item: item});
          opt && selectOptions.remove(opt.id());
          break;
        case 'updated:':
          selectOptions['find'](function(oldItem){
            if(oldItem.item == item){
              oldItem.set('itemId', item.id());
              oldItem.set('name', item.get(opts.nameKeyPath));
            }
          });
          break;
        }
    });      
    
    // Select added items when there is no selection
    selectOptions.on('added:', (item: SelectOption) => {
      if(this.selectingId){
        if(item.get('item').checkId(this.selectingId)){
          this.selectItem(item);
        }
      }else if(!this.get('selectedItem')){
        this.selectItem(item);
      }
    });

    // Select first item when the current selection is removed
    selectOptions.on('removed:', (item: Gnd.Model) => {
      if(item === this.selectedItem){
        this.selectItem(selectOptions['first']());
      }
    });
      
    if(opts.selectedId) {
      // Wait a tick to activate any selection event that might be attached
      Gnd.Util.nextTick(() => {
        this.selectById(opts.selectedId);  
      })
    }

    opts.parent && this.parent(opts.parent);
  }
    
  destroy()
  {
    Gnd.Base.release(this.viewModel, this.selectOptions, this.dropdownProxy);
    super.destroy();
  }
    
  render(context?: {}): Gnd.Promise<HTMLElement>
  {
    context = _.extend({
      standard: this.opts.standard,
      classname: false
    }, context);
      
    return super.render(context).then<HTMLElement>((el) => {
      this.viewModel = new Gnd.ViewModel(el, {
        collection: this.selectOptions,
        combobox: this.dropdownProxy
      },
      {escape: _.escape});

      // events
      Gnd.$('.gnd-dropdown-selected',el).on('click', () => {
        this.activate(el);
      })
      
      Gnd.$(el).on('blur', () => {
        this.deactivate(el);
      })
      
      return el;
    });
  }
    
  activate(el?)
  {
    Gnd.$('.gnd-dropdown', this.root).addClass('gnd-active').trigger('focus');
    // Adjust selected element to the input element - we dont use this by default
//      var $active = $('.gnd-dropdown-item-selected',this.root);
//      var $optionContainer = $('.gnd-dropdown-optionlist',this.root);
//      if($active) {
//        var index = $('.gnd-dropdown-option',this.root).index($active);
//        $optionContainer.css('top',-$active.outerHeight()*index+'px');
//      }
  }
    
  deactivate(el?){
    Gnd.$('.gnd-dropdown', this.root).removeClass('gnd-active')          
  }
    
  selectItem(item: Gnd.Model)
  {
    if(item) {
      this.selectedItem && this.selectedItem.set('isSelected', false);
        
      this.set('selectedName', item.get('name'));
      this.set('selectedItem', item);
      item.set('isSelected', true);
        
      this.set('selectedId', item.get('itemId'));
        
      this.emit('selected:', item.get('item'));
    } else {
      this.set('selectedName','');
      this.emit('removedLast:');
    }
  }
  
  selectById(id)
  {
    if(id !== this.selectedId && id !== this.selectingId){
      var item = this.selectOptions['find']((opt) => {
        return opt.item.checkId(id);
      });
        
      if(item && !item.disabled) {
        this.selectItem(item);
      }else{
        this.selectingId = id;
      }    
    }
  }
}

//
// Boiler plate needed to TypeScript deficient module support.
//
declare var define;
declare var exports;
(function (root, factory) {
  if (typeof exports === 'object') {
    root['module'].exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define('gnd/dropdown', ['gnd'], factory);
  } else {
    // Browser globals (root is window)
    root.returnExports = factory();
  }
}(this, function () {
    return DropDown;
}));
