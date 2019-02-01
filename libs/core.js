/**
 * UI
 */

const WIN = require('ui/window');
const LANG = require('../language/');
const LANG_T = antSword["language"]['toastr'];
const Tabbar = require('ui/tabbar');


class Core {
  constructor(opt) {
    let self = this;
    self.createUI(opt);
    self.core = new antSword['core'][opt['type']](opt);
    return {
      onExecute: (func) => {
        self.bindToolbarClickHandler(func);
      },
      onAbout: () => {}
    }
  }

  createUI(opt) {
    let self = this;
    self.opt = opt;
    self.tabbar = new Tabbar();
    self.tabbar.cell.setText(`<i class="fa fa-code"></i> ${LANG['title']} - ${opt['ip']}`);
    this.layout_main = self.tabbar.cell.attachLayout('2E');
    this.Editorview = this.layout_main.cells('a');
    this.Resultview = this.layout_main.cells('b');
    this.Toolbar = this.createToolbar(this.Editorview);
    this.Result = this.createResult(this.Resultview);
    this.createEditor(opt);
  }


  createToolbar(layout) {
    let self = this;
    layout.setText(`<i class="fa fa-code"></i> ${LANG['cella']['title']}`);
    const toolbar = layout.attachToolbar();
    toolbar.loadStruct([
      {id: 'label', type:'text', text: LANG['cella']['script'],},
        { id:`${self.opt['type']}`, type: 'text', text:`${self.opt['type'].toUpperCase()}`},
        { id: 'execute', type: 'button', icon: 'check', text: LANG['cella']['start'],icon:'play'},
        { id: 'clear', type: 'button', text: LANG['cella']['clear'], icon: 'remove' }
        ]);
    self.toolbar = toolbar;
  }

  createResult(layout){
    let self = this;
    layout.setText(`<i class="fa fa-code"></i> ${LANG['cellb']['title']}`);
    const toolbar = layout.attachToolbar();
    toolbar.loadStruct([
      { id: 'view_type_label', type: 'text', text: 'View as: text' },
      { type: 'separator' },
      { id: 'data_size', type: 'text', text: "Size:0b" },
    ]);
    let editor;
    editor = ace.edit(layout.cell.lastChild);
    editor.$blockScrolling = Infinity;
    editor.setTheme('ace/theme/tomorrow');
    editor.session.setMode('ace/mode/html');
    editor.session.setUseWrapMode(true);
    editor.session.setWrapLimitRange(null,null);
    editor.setOptions({
      fontSize: '14px',
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true
    });
    return {
      editor: editor,
      layout: layout,
      toolbar: toolbar,
    }

  }


  createEditor(opt){
    let self = this;
    self.defScript = "";
    switch (self.opt['type']){
      case "php":
        self.defScript = "phpinfo();";
      break
      case "asp":
        self.defScript = 'Response.Write("Hello ASP!")';
      break
      case "aspx":
        self.defScript = 'Response.Write("Hello JScript.NET!");';
      break
    } 
    self.editor = null;
    // 初始化编辑器
    self.editor = ace.edit(this.Editorview.cell.lastChild);
    self.editor.$blockScrolling = Infinity;
    self.editor.setTheme('ace/theme/tomorrow');
    self.editor.session.setMode(`ace/mode/php`);
    self.editor.session.setMode(`ace/mode/vbscript`);
    self.editor.session.setUseWrapMode(true);
    self.editor.session.setWrapLimitRange(null, null);
    self.editor.session.setValue(self.defScript);

    self.editor.setOptions({
      fontSize: '14px',
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true
    });
    // 编辑器快捷键
    self.editor.commands.addCommand({
      name: 'import',
      bindKey: {
        win: 'Ctrl-S',
        mac: 'Command-S'
      },
      exec: () => {
        self.toolbar.callEvent('onClick', ['execute']);
      }
    });
    const inter = setInterval(self.editor.resize.bind(self.editor), 200);
      this.Editorview.attachEvent('onClose', () => {
        clearInterval(inter);
        return true;
    });
  }


  bindToolbarClickHandler(callback) {
    let self = this;
    self.toolbar.attachEvent('onClick', (id) => {
      switch(id){
      case "execute":
        self.core.request({
      _: self.editor.session.getValue()
    }).then((_ret) => {
      self.Result.editor.session.setValue(_ret['text']);
      self.Result.editor.setReadOnly(true);
      self.Result.toolbar.setItemText('data_size', `Size: ${self.keySize(_ret['text'].length)}`);

     });
        break
      case "clear":
        self.editor.session.setValue("");
        break
      }
    });
  }

  keySize(t) {
    let i = false;
    let b = ["b","Kb","Mb","Gb","Tb","Pb","Eb"];
    for (let q=0; q<b.length; q++) if (t > 1024) t = t / 1024; else if (i === false) i = q;
    if (i === false) i = b.length-1;
    return Math.round(t*100)/100+" "+b[i];
  }

}

module.exports = Core;
