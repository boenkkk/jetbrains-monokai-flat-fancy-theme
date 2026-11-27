package com.github.boenkkk.jetbrains.monokaiflatfancy;

import com.intellij.ide.ui.LafManager;
import com.intellij.ide.ui.LafManagerListener;
import com.intellij.ide.ui.laf.UIThemeLookAndFeelInfo;
import com.intellij.openapi.editor.colors.EditorColorsManager;
import com.intellij.openapi.editor.colors.EditorColorsScheme;
import org.jetbrains.annotations.NotNull;

import java.util.Map;

/**
 * Applies the matching editor scheme when a Monokai Flat Fancy UI theme is selected.
 * The IDE otherwise restores the last scheme used with that theme, which can
 * leave a light editor active after choosing a dark variant.
 */
public final class ThemeSchemeSynchronizer implements LafManagerListener {
  private static final Map<String, String> SCHEME_PATHS = Map.of(
    "com.github.boenkkk.monokaiflatfancy.default", "/themes/monokai-flat-fancy-default.xml",
    "com.github.boenkkk.monokaiflatfancy.darker", "/themes/monokai-flat-fancy-darker.xml",
    "com.github.boenkkk.monokaiflatfancy.light", "/themes/monokai-flat-fancy-light.xml"
  );

  @Override
  public void lookAndFeelChanged(@NotNull LafManager source) {
    UIThemeLookAndFeelInfo theme = source.getCurrentUIThemeLookAndFeel();
    if (theme == null) return;

    String path = SCHEME_PATHS.get(theme.getId());
    if (path == null) return;

    EditorColorsManager colorsManager = EditorColorsManager.getInstance();
    EditorColorsScheme scheme = colorsManager.getScheme(path);
    if (scheme != null) {
      colorsManager.setGlobalScheme(scheme);
    }
  }
}
