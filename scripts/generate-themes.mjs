import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ATTRIBUTE_GROUPS,
  BACKGROUND_GROUPS,
  PLUGIN,
  RAINBOW_GROUPS,
  VARIANTS,
} from './theme-config.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const themesDir = resolve(root, 'src/main/resources/themes');

function parseHex(value) {
  const hex = value.replace('#', '');
  if (!/^[\da-f]{6}([\da-f]{2})?$/i.test(hex)) {
    throw new Error(`Unsupported color value: ${value}`);
  }
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
    a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
}

function toHex({ r, g, b }) {
  return [r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/** JetBrains color schemes store RGB only, so alpha colors are composited first. */
function flatten(foreground, background, opacity) {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  const alpha = opacity ?? fg.a;
  return toHex({
    r: fg.r * alpha + bg.r * (1 - alpha),
    g: fg.g * alpha + bg.g * (1 - alpha),
    b: fg.b * alpha + bg.b * (1 - alpha),
  });
}

function rgb(value, background) {
  return flatten(value, background).replace('#', '');
}

function namedColors(variant) {
  const c = variant.sourceColors;
  const t = variant.tokenColors;
  const base = c['editor.background'];
  const transparent = (key, opacity) => `#${flatten(c[key], base, opacity)}`;
  const pick = (key, fallback) => c[key] ?? fallback;

  return {
    accentColor: pick('focusBorder', '#75715E'),
    secondaryAccentColor: c['button.background'],
    primaryForeground: c['editor.foreground'],
    primaryBackground: base,
    secondaryBackground: c['dropdown.background'],
    inactiveBackground: pick('tab.inactiveBackground', base),
    panelBackground: pick('sideBar.background', base),
    toolbarBackground: pick('titleBar.activeBackground', base),
    hoverBackground: c['list.hoverBackground'],
    selectionBackground: c['list.activeSelectionBackground'],
    selectionInactiveBackground: c['list.inactiveSelectionBackground'],
    selectionForeground: c['list.highlightForeground'],
    borderColor: c['contrastBorder'],
    separatorColor: pick('editorGroupHeader.tabsBorder', c['contrastBorder']),
    searchMatchBackground: c['peekViewEditor.matchHighlightBackground'],
    textFieldBackground: c['input.background'],
    tabBackground: pick('tab.activeBackground', base),
    caretColor: c['editorCursor.foreground'],
    lineHighlight: c['editor.lineHighlightBackground'],
    lineNumber: c['editorLineNumber.foreground'],
    activeLineNumber: c['editorLineNumber.activeForeground'],
    indentGuide: c['editorIndentGuide.background'],
    activeIndentGuide: c['editorIndentGuide.activeBackground'],
    whitespace: c['editorWhitespace.foreground'],
    inlayForeground: c['editorInlayHint.foreground'],
    inlayBackground: c['editorInlayHint.background'],
    errorColor: c['inputValidation.errorBorder'],
    warningColor: c['inputValidation.warningBorder'],
    infoColor: c['inputValidation.infoBorder'],
    successColor: t.function,
    diffInserted: transparent('diffEditor.insertedTextBackground'),
    diffRemoved: transparent('diffEditor.removedTextBackground'),
    diffModified: t.changed,
    editorSelection: transparent('editor.selectionBackground'),
    selectionHighlight: transparent('editor.selectionHighlightBackground'),
    wordHighlight: transparent('editor.wordHighlightBackground'),
    wordHighlightStrong: transparent('editor.wordHighlightStrongBackground'),
    consoleBackground: base,
    menuBackground: pick('menu.background', c['dropdown.background']),
    suggestBackground: c['editorSuggestWidget.background'],
    inactiveForeground: pick('tab.inactiveForeground', c['editor.foreground']),
  };
}

/** UI component overrides. Values reference names declared in `colors`. */
function uiOverrides(variant, colors) {
  const t = variant.tokenColors;
  return {
    '*': {
      background: 'primaryBackground',
      foreground: 'primaryForeground',
      disabledBackground: 'primaryBackground',
      inactiveBackground: 'inactiveBackground',
      borderColor: 'borderColor',
      separatorColor: 'separatorColor',
      focusColor: 'accentColor',
      selectionBackground: 'selectionBackground',
      selectionForeground: 'selectionForeground',
      selectionInactiveBackground: 'selectionInactiveBackground',
      selectionInactiveForeground: 'primaryForeground',
      errorFocusColor: 'errorColor',
      warningFocusColor: 'warningColor',
    },
    Borders: {
      color: 'borderColor',
      ContrastBorderColor: 'secondaryBackground',
    },
    ActionButton: {
      hoverBackground: 'hoverBackground',
      pressedBackground: 'selectionBackground',
      hoverBorderColor: 'hoverBackground',
      pressedBorderColor: 'selectionBackground',
    },
    Banner: {
      borderColor: 'borderColor',
    },
    Bookmark: {
      iconBackground: 'accentColor',
      Mnemonic: {
        iconForeground: 'primaryForeground',
        iconBackground: 'secondaryBackground',
        iconBorderColor: 'accentColor',
      },
    },
    Button: {
      foreground: 'primaryForeground',
      startBackground: 'secondaryBackground',
      endBackground: 'secondaryBackground',
      startBorderColor: 'borderColor',
      endBorderColor: 'borderColor',
      focusedBorderColor: 'accentColor',
      disabledBorderColor: 'borderColor',
      default: {
        foreground: '#FFFFFF',
        startBackground: 'secondaryAccentColor',
        endBackground: 'secondaryAccentColor',
        startBorderColor: 'secondaryAccentColor',
        endBorderColor: 'secondaryAccentColor',
        focusColor: 'secondaryAccentColor',
        focusedBorderColor: 'accentColor',
      },
    },
    CheckBox: {
      borderColor: 'borderColor',
    },
    ComboBox: {
      background: 'textFieldBackground',
      selectionBackground: 'selectionBackground',
      nonEditableBackground: 'secondaryBackground',
      modifiedItemForeground: 'accentColor',
      ArrowButton: {
        background: 'secondaryBackground',
        nonEditableBackground: 'secondaryBackground',
        iconColor: 'accentColor',
      },
    },
    Component: {
      focusColor: 'accentColor',
      borderColor: 'borderColor',
      focusedBorderColor: 'accentColor',
      disabledBorderColor: 'borderColor',
      errorFocusColor: 'errorColor',
      inactiveErrorFocusColor: 'errorColor',
      warningFocusColor: 'warningColor',
      inactiveWarningFocusColor: 'warningColor',
    },
    CompletionPopup: {
      selectionBackground: 'selectionBackground',
      selectionInactiveBackground: 'selectionInactiveBackground',
      matchForeground: 'accentColor',
    },
    Counter: {
      foreground: 'primaryBackground',
      background: 'accentColor',
    },
    DragAndDrop: {
      borderColor: 'accentColor',
    },
    Editor: {
      background: 'primaryBackground',
      shortcutForeground: 'accentColor',
    },
    EditorPane: {
      background: 'primaryBackground',
    },
    EditorTabs: {
      background: 'primaryBackground',
      hoverBackground: 'hoverBackground',
      underlineColor: 'accentColor',
      underlinedTabBackground: 'tabBackground',
      inactiveUnderlinedTabBackground: 'inactiveBackground',
      underlinedBorderColor: 'accentColor',
      underTabsBorderColor: 'separatorColor',
      underlineHeight: 2,
      unselectedBlend: 0.9,
    },
    FileColor: {
      Gray: colors.secondaryBackground,
      Blue: t.type,
      Green: t.function,
      Orange: t.inlineRaw,
      Rose: t.keyword,
      Violet: t.number,
      Yellow: t.string,
    },
    Label: {
      foreground: 'primaryForeground',
    },
    Link: {
      activeForeground: 'accentColor',
      hoverForeground: 'accentColor',
      visitedForeground: 'secondaryAccentColor',
      pressedForeground: 'secondaryAccentColor',
    },
    List: {
      background: 'panelBackground',
      hoverBackground: 'hoverBackground',
      selectionBackground: 'selectionBackground',
      selectionInactiveBackground: 'selectionInactiveBackground',
    },
    MainToolbar: {
      background: 'toolbarBackground',
    },
    MemoryIndicator: {
      usedColor: 'accentColor',
      allocatedColor: 'secondaryBackground',
    },
    Notification: {
      background: 'panelBackground',
      borderColor: 'accentColor',
      errorBackground: 'panelBackground',
      errorBorderColor: 'errorColor',
      errorForeground: 'primaryForeground',
      warningBackground: 'panelBackground',
      warningBorderColor: 'warningColor',
      ToolWindow: {
        informativeBackground: 'panelBackground',
        informativeBorderColor: 'infoColor',
        warningBackground: 'panelBackground',
        warningBorderColor: 'warningColor',
        errorBackground: 'panelBackground',
        errorBorderColor: 'errorColor',
      },
    },
    NotificationsToolwindow: {
      newNotification: {
        background: 'primaryBackground',
        hoverBackground: 'hoverBackground',
      },
    },
    Panel: {
      background: 'panelBackground',
    },
    PasswordField: {
      background: 'textFieldBackground',
    },
    Plugins: {
      hoverBackground: 'hoverBackground',
      lightSelectionBackground: 'selectionInactiveBackground',
      SearchField: {
        background: 'textFieldBackground',
      },
      SectionHeader: {
        foreground: 'primaryForeground',
      },
      Button: {
        installBackground: 'primaryBackground',
        installForeground: 'secondaryAccentColor',
        installBorderColor: 'secondaryAccentColor',
        installFocusedBackground: 'primaryBackground',
        updateBackground: 'accentColor',
        updateForeground: '#FFFFFF',
        updateBorderColor: 'accentColor',
      },
      Tab: {
        selectedBackground: 'selectionBackground',
        selectedForeground: 'primaryForeground',
        hoverBackground: 'hoverBackground',
      },
    },
    Popup: {
      borderColor: 'accentColor',
      Header: {
        activeBackground: 'secondaryBackground',
        inactiveBackground: 'inactiveBackground',
      },
    },
    ProgressBar: {
      trackColor: 'selectionInactiveBackground',
      progressColor: 'accentColor',
      indeterminateStartColor: 'accentColor',
      indeterminateEndColor: 'secondaryAccentColor',
      passedColor: 'successColor',
      passedEndColor: 'successColor',
      failedColor: 'errorColor',
      failedEndColor: 'errorColor',
    },
    RadioButton: {
      borderColor: 'borderColor',
    },
    RunWidget: {
      background: 'panelBackground',
    },
    ScrollBar: {
      thumbColor: 'indentGuide',
      thumbBorderColor: 'indentGuide',
      hoverThumbColor: 'activeIndentGuide',
      hoverThumbBorderColor: 'activeIndentGuide',
    },
    SearchEverywhere: {
      SearchField: {
        background: 'textFieldBackground',
      },
      Advertiser: {
        foreground: 'primaryForeground',
      },
      Tab: {
        selectedBackground: 'secondaryBackground',
        selectedForeground: 'primaryForeground',
      },
    },
    SearchMatch: {
      startBackground: 'searchMatchBackground',
      endBackground: 'searchMatchBackground',
    },
    SegmentedButton: {
      hoverBackground: 'hoverBackground',
      selectedBackground: 'selectionBackground',
    },
    Separator: {
      separatorColor: 'separatorColor',
    },
    SidePanel: {
      background: 'panelBackground',
    },
    Slider: {
      trackColor: 'selectionInactiveBackground',
      progressColor: 'accentColor',
    },
    StatusBar: {
      background: 'panelBackground',
      borderColor: 'borderColor',
      hoverBackground: 'hoverBackground',
      Breadcrumbs: {
        chevronInset: 0,
      },
    },
    TabbedPane: {
      contentAreaColor: 'primaryBackground',
      focusColor: 'hoverBackground',
      hoverColor: 'hoverBackground',
      underlineColor: 'accentColor',
      tabSelectionHeight: 2,
    },
    Table: {
      gridColor: 'borderColor',
      hoverBackground: 'selectionInactiveBackground',
    },
    TableHeader: {
      bottomSeparatorColor: 'borderColor',
    },
    TextField: {
      background: 'textFieldBackground',
    },
    TextArea: {
      background: 'primaryBackground',
    },
    ToggleButton: {
      onBackground: 'successColor',
      onForeground: 'primaryBackground',
      offBackground: 'selectionInactiveBackground',
      offForeground: 'primaryForeground',
      buttonColor: 'primaryForeground',
    },
    ToolBar: {
      background: 'toolbarBackground',
      borderHandleColor: 'accentColor',
    },
    ToolWindow: {
      Button: {
        hoverBackground: 'hoverBackground',
      },
      Header: {
        background: 'primaryBackground',
        inactiveBackground: 'inactiveBackground',
        borderColor: 'borderColor',
      },
      HeaderTab: {
        underlineColor: 'accentColor',
        inactiveUnderlineColor: 'inactiveForeground',
        underlineHeight: 2,
        underlinedTabBackground: 'tabBackground',
        hoverBackground: 'hoverBackground',
      },
    },
    Tree: {
      background: 'panelBackground',
      hoverBackground: 'hoverBackground',
      selectionBackground: 'selectionBackground',
      selectionInactiveBackground: 'selectionInactiveBackground',
      modifiedItemForeground: 'accentColor',
      rowHeight: 24,
    },
    ValidationTooltip: {
      errorBackground: 'panelBackground',
      errorBorderColor: 'errorColor',
      warningBackground: 'panelBackground',
      warningBorderColor: 'warningColor',
    },
    VersionControl: {
      GitLog: {
        headIconColor: t.number,
        localBranchIconColor: t.function,
        remoteBranchIconColor: 'secondaryAccentColor',
        tagIconColor: 'accentColor',
        otherIconColor: 'accentColor',
      },
      Log: {
        Commit: {
          hoveredBackground: 'selectionInactiveBackground',
          currentBranchBackground: 'secondaryBackground',
        },
      },
      RefLabel: {
        foreground: 'primaryForeground',
      },
    },
    WelcomeScreen: {
      separatorColor: 'separatorColor',
      SidePanel: {
        background: 'secondaryBackground',
      },
      Projects: {
        background: 'hoverBackground',
        selectionBackground: 'secondaryBackground',
        selectionInactiveBackground: 'secondaryBackground',
        actions: {
          background: 'hoverBackground',
        },
      },
    },
  };
}

function iconPalette(variant) {
  const t = variant.tokenColors;
  return {
    'Actions.Blue': t.type,
    'Actions.Green': t.function,
    'Actions.Red': t.keyword,
    'Actions.Yellow': t.string,
    'Actions.Grey': t.diffMeta,
    'Actions.GreyInline.Dark': t.type,
    'Actions.GreyInline': t.type,
    'Objects.Blue': t.type,
    'Objects.Green': t.function,
    'Objects.Grey': t.diffMeta,
    'Objects.Pink': t.keyword,
    'Objects.Purple': t.number,
    'Objects.Red': t.keyword,
    'Objects.RedStatus': t.error,
    'Objects.Yellow': t.string,
    'Objects.YellowDark': t.changed,
    'Objects.BlackText': variant.sourceColors['editor.background'],
    'Tree.iconColor': t.type,
  };
}

function buildThemeJson(variant) {
  const colors = namedColors(variant);
  const ui = uiOverrides(variant, colors);
  return JSON.stringify({
    name: variant.label,
    author: PLUGIN.author,
    dark: variant.dark,
    editorScheme: `/themes/monokai-flat-fancy-${variant.id}.xml`,
    colors,
    ui,
    icons: { ColorPalette: iconPalette(variant) },
  }, null, 2) + '\n';
}

function editorColors(variant, c, t) {
  const base = c['editor.background'];
  const fromNamed = namedColors(variant);
  const v = (color) => rgb(color, base);
  const values = {
    ADDED_LINES_COLOR: v(fromNamed.diffInserted),
    ANNOTATIONS_COLOR: v(c['editor.foreground']),
    BLOCK_TERMINAL_DEFAULT_BACKGROUND: v(base),
    BLOCK_TERMINAL_DEFAULT_FOREGROUND: v(c['editor.foreground']),
    BLOCK_TERMINAL_INACTIVE_SELECTED_BLOCK_BACKGROUND: v(c['list.inactiveSelectionBackground']),
    BLOCK_TERMINAL_SELECTED_BLOCK_BACKGROUND: v(c['list.activeSelectionBackground']),
    BLOCK_TERMINAL_SELECTED_BLOCK_STROKE_COLOR: v(t.type),
    BOOKMARK_ICON_COLOR: v(t.keyword),
    CARET_COLOR: v(c['editorCursor.foreground']),
    CARET_ROW_COLOR: v(c['editor.lineHighlightBackground']),
    CONSOLE_BACKGROUND_KEY: v(base),
    DELETED_LINES_COLOR: v(fromNamed.diffRemoved),
    DIFF_SEPARATORS_BACKGROUND: v(c['contrastBorder']),
    DOCUMENTATION_COLOR: v(c['editorWidget.background']),
    ERROR_HINT: v(t.invalid),
    FILESTATUS_ADDED: v(t.function),
    FILESTATUS_COPIED: v(t.function),
    FILESTATUS_DELETED: v(t.diffMeta),
    FILESTATUS_HIJACKED: v(t.changed),
    FILESTATUS_IGNORED: v(t.diffMeta),
    FILESTATUS_MERGED: v(t.number),
    FILESTATUS_MODIFIED: v(t.type),
    FILESTATUS_SUPPRESSED: v(t.diffMeta),
    FILESTATUS_SWITCHED: v(t.number),
    FILESTATUS_UNKNOWN: v(t.diffMeta),
    FOLDED_TEXT_BORDER_COLOR: '',
    GUTTER_BACKGROUND: v(base),
    HTML_TAG_TREE_LEVEL0: v(t.keyword),
    HTML_TAG_TREE_LEVEL1: v(t.string),
    HTML_TAG_TREE_LEVEL2: v(t.function),
    HTML_TAG_TREE_LEVEL3: v(t.type),
    HTML_TAG_TREE_LEVEL4: v(t.number),
    HTML_TAG_TREE_LEVEL5: v(t.support),
    INDENT_GUIDE: v(c['editorIndentGuide.background']),
    INFORMATION_HINT: v(c['editorInlayHint.background']),
    INLINE_REFACTORING_SETTINGS_DEFAULT: v(fromNamed.indentGuide),
    INLINE_REFACTORING_SETTINGS_FOCUSED: v(fromNamed.activeIndentGuide),
    INLINE_REFACTORING_SETTINGS_HOVERED: v(fromNamed.activeIndentGuide),
    LINE_NUMBERS_COLOR: v(c['editorLineNumber.foreground']),
    LINE_NUMBER_ON_CARET_ROW_COLOR: v(c['editorLineNumber.activeForeground']),
    LOOKUP_COLOR: v(c['editorSuggestWidget.background']),
    METHOD_SEPARATORS_COLOR: v(c['editorIndentGuide.background']),
    MODIFIED_LINES_COLOR: v(fromNamed.diffModified),
    MODIFIED_TAB_ICON: v(t.type),
    NOTIFICATION_BACKGROUND: v(c['editorWidget.background']),
    PROMOTION_PANE: v(c['editorWidget.background']),
    QUESTION_HINT: v(c['editorInlayHint.background']),
    RECENT_LOCATIONS_SELECTION: v(c['editorSuggestWidget.background']),
    RIGHT_MARGIN_COLOR: v(c['editorIndentGuide.background']),
    MATCHED_BRACES_INDENT_GUIDE_COLOR: v(c['editorIndentGuide.activeBackground']),
    SELECTED_INDENT_GUIDE: v(c['editorIndentGuide.activeBackground']),
    SELECTED_TEARLINE_COLOR: v(c['editorIndentGuide.activeBackground']),
    SELECTION_BACKGROUND: v(fromNamed.editorSelection),
    SELECTION_FOREGROUND: '',
    SEPARATOR_BELOW_COLOR: '',
    'ScrollBar.thumbColor': v(c['editorIndentGuide.background']),
    'ScrollBar.thumbBorderColor': v(c['editorIndentGuide.background']),
    'ScrollBar.hoverThumbColor': v(c['editorIndentGuide.activeBackground']),
    'ScrollBar.hoverThumbBorderColor': v(c['editorIndentGuide.activeBackground']),
    TAB_UNDERLINE: v(c['focusBorder']),
    TAB_UNDERLINE_INACTIVE: v(c['tab.activeBorder']),
    TEARLINE_COLOR: v(c['editorIndentGuide.background']),
    VISUAL_INDENT_GUIDE: v(c['editorIndentGuide.background']),
    WHITESPACES: v(c['editorWhitespace.foreground']),
    WHITESPACES_MODIFIED_LINES_COLOR: v(c['editorWhitespace.foreground']),
  };

  for (const [index, alpha] of [0.4, 0.32, 0.26, 0.18, 0.1].entries()) {
    values[`VCS_ANNOTATIONS_COLOR_${index + 1}`] = flatten(t.type, base, alpha);
  }

  const ansi = {
    BLACK: c['terminal.ansiBlack'],
    RED: c['terminal.ansiRed'],
    GREEN: c['terminal.ansiGreen'],
    YELLOW: c['terminal.ansiYellow'],
    BLUE: c['terminal.ansiBlue'],
    MAGENTA: c['terminal.ansiMagenta'],
    CYAN: c['terminal.ansiCyan'],
    WHITE: c['terminal.ansiWhite'],
    BLACK_BRIGHT: c['terminal.ansiBrightBlack'],
    RED_BRIGHT: c['terminal.ansiBrightRed'],
    GREEN_BRIGHT: c['terminal.ansiBrightGreen'],
    YELLOW_BRIGHT: c['terminal.ansiBrightYellow'],
    BLUE_BRIGHT: c['terminal.ansiBrightBlue'],
    MAGENTA_BRIGHT: c['terminal.ansiBrightMagenta'],
    CYAN_BRIGHT: c['terminal.ansiBrightCyan'],
    WHITE_BRIGHT: c['terminal.ansiBrightWhite'],
  };
  values.BLOCK_TERMINAL_BLOCK_BACKGROUND_END = v(c['editorWidget.background']);
  values.BLOCK_TERMINAL_BLOCK_BACKGROUND_START = v(c['editorWidget.background']);
  values.BLOCK_TERMINAL_ERROR_BLOCK_STROKE_COLOR = v(t.error);
  values.BLOCK_TERMINAL_INACTIVE_SELECTED_BLOCK_STROKE_COLOR = v(c['editorIndentGuide.background']);
  values.BLOCK_TERMINAL_PROMPT_SEPARATOR_COLOR = v(c['editorIndentGuide.background']);

  return { values, ansi };
}

function buildEditorScheme(variant) {
  const c = variant.sourceColors;
  const t = variant.tokenColors;
  const base = c['editor.background'];
  const emitted = new Set();
  const lines = [];

  const pushForeground = (name, color, fontType) => {
    if (emitted.has(name)) return;
    emitted.add(name);
    lines.push(`    <option name="${name}">`);
    lines.push('      <value>');
    lines.push(`        <option name="FOREGROUND" value="${rgb(color, base)}"/>`);
    if (fontType) lines.push(`        <option name="FONT_TYPE" value="${fontType}"/>`);
    lines.push('      </value>');
    lines.push('    </option>');
  };

  const roleColors = {
    text: c['editor.foreground'],
    comment: t.comment,
    string: t.string,
    number: t.number,
    keyword: t.keyword,
    type: t.type,
    function: t.function,
    support: t.support,
    jsonKey: t.jsonKey,
    doctype: t.doctype,
    inlineRaw: t.inlineRaw,
    error: t.invalid,
    warn: t.warn,
    info: t.info,
    debug: t.debug,
    heading: t.heading,
    list: t.list,
    quote: t.quote,
    linkTitle: t.linkTitle,
    diffMeta: t.diffMeta,
  };

  for (const [role, group] of Object.entries(ATTRIBUTE_GROUPS)) {
    for (const name of group.names) {
      pushForeground(name, roleColors[role] ?? c['editor.foreground'], group.style);
    }
  }

  const rainbow = [t.keyword, t.changed, t.function, t.support, t.number];
  for (const [index, names] of Object.entries(RAINBOW_GROUPS)) {
    for (const name of names) pushForeground(name, rainbow[index]);
  }

  const named = namedColors(variant);
  const namedBackgrounds = {
    selectionBackground: named.editorSelection,
    selectionHighlightBackground: named.selectionHighlight,
    wordHighlightBackground: named.wordHighlight,
    wordHighlightStrongBackground: named.wordHighlightStrong,
    diffInserted: named.diffInserted,
    diffRemoved: named.diffRemoved,
    diffModified: named.diffModified,
  };
  const backgroundRoles = {
    selectionBackground: t.keyword,
    selectionHighlightBackground: t.type,
    wordHighlightBackground: t.function,
    wordHighlightStrongBackground: t.function,
    diffInserted: t.inserted,
    diffRemoved: t.deleted,
    diffModified: t.changed,
  };
  for (const group of Object.values(BACKGROUND_GROUPS)) {
    const foreground = backgroundRoles[group.background] ?? c['editor.foreground'];
    const background = namedBackgrounds[group.background];
    for (const name of group.names) {
      if (emitted.has(name)) continue;
      emitted.add(name);
      lines.push(`    <option name="${name}">`);
      lines.push('      <value>');
      lines.push(`        <option name="FOREGROUND" value="${rgb(foreground, base)}"/>`);
      lines.push(`        <option name="BACKGROUND" value="${rgb(background, base)}"/>`);
      lines.push('      </value>');
      lines.push('    </option>');
    }
  }

  const { values: colors, ansi } = editorColors(variant, c, t);
  const pushAttribute = (name, options) => {
    if (emitted.has(name)) return;
    emitted.add(name);
    lines.push(`    <option name="${name}">`);
    lines.push('      <value>');
    for (const [key, value] of Object.entries(options)) {
      lines.push(`        <option name="${key}" value="${value}"/>`);
    }
    lines.push('      </value>');
    lines.push('    </option>');
  };

  for (const [name, color] of Object.entries(ansi)) {
    const value = rgb(color, base);
    pushAttribute(`BLOCK_TERMINAL_${name}`, { FOREGROUND: value, BACKGROUND: value });
    pushAttribute(`CONSOLE_${name}_OUTPUT`, { FOREGROUND: value });
  }
  pushAttribute('CONSOLE_NORMAL_OUTPUT', { FOREGROUND: rgb(c['editor.foreground'], base) });
  pushAttribute('CONSOLE_ERROR_OUTPUT', { FOREGROUND: rgb(t.error, base) });
  pushAttribute('CONSOLE_SYSTEM_OUTPUT', { FOREGROUND: rgb(t.comment, base) });
  pushAttribute('CONSOLE_USER_INPUT', { FOREGROUND: rgb(t.string, base) });

  const colorLines = Object.entries(colors)
    .map(([name, value]) => `    <option name="${name}" value="${value}"/>`)
    .join('\n');

  return [
    `<scheme name="${variant.label}" version="142" parent_scheme="${variant.parentScheme}">`,
    '  <colors>',
    colorLines,
    '  </colors>',
    '  <attributes>',
    ...lines,
    '  </attributes>',
    '</scheme>',
    '',
  ].join('\n');
}

mkdirSync(themesDir, { recursive: true });
for (const variant of VARIANTS) {
  const jsonPath = resolve(themesDir, `monokai-flat-fancy-${variant.id}.theme.json`);
  const xmlPath = resolve(themesDir, `monokai-flat-fancy-${variant.id}.xml`);
  const json = buildThemeJson(variant);
  const xml = buildEditorScheme(variant);
  JSON.parse(json);
  if (/value="(?!$)[^"]*#/.test(xml)) throw new Error(`Unexpected # in XML colors: ${variant.id}`);
  writeFileSync(jsonPath, json);
  writeFileSync(xmlPath, xml);
  console.log(`Generated ${jsonPath}`);
  console.log(`Generated ${xmlPath}`);
}
