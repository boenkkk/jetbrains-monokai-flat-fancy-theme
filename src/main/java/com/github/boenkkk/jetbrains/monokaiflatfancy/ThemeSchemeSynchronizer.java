package com.github.boenkkk.jetbrains.monokaiflatfancy;

import com.intellij.ide.ui.LafManager;
import com.intellij.ide.ui.LafManagerListener;
import com.intellij.ide.ui.laf.UIThemeLookAndFeelInfo;
import com.intellij.openapi.editor.colors.EditorColorsManager;
import com.intellij.openapi.editor.colors.EditorColorsScheme;
import org.jetbrains.annotations.NotNull;

import java.util.Map;

/**
 * Keeps the editor color scheme in sync with the Monokai Flat Fancy UI theme.
 * The IDE restores the last scheme used with a theme, which can leave a light
 * editor active after selecting a dark variant.
 */
public final class ThemeSchemeSynchronizer implements LafManagerListener {
  private static final Map<String, String> SCHEMES = Map.of(
    "com.github.boenkkk.monokaiflatfancy.default", "Monokai Flat Fancy Default",
    "com.github.boenkkk.monokaiflatfancy.darker", "Monokai Flat Fancy Darker",
    "com.github.boenkkk.monokaiflatfancy.light", "Monokai Flat Fancy Light"
  );

  @Override
  public void lookAndFeelChanged(@NotNull LafManager source) {
    UIThemeLookAndFeelInfo theme = source.getCurrentUIThemeLookAndFeel();
    if (theme == null) return;

    String schemeName = SCHEMES.get(theme.getId());
    if (schemeName == null) return;

    EditorColorsManager colorsManager = EditorColorsManager.getInstance();
    EditorColorsScheme scheme = colorsManager.getScheme(schemeName);
    if (scheme != null) {
      colorsManager.setGlobalScheme(scheme);
    }
  }
}
