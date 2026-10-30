package com.smartpay.soundbox.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = EmeraldNeon,
    onPrimary = Obsidian950,
    primaryContainer = Obsidian800,
    onPrimaryContainer = Emerald400,
    secondary = CyanNeon,
    onSecondary = Obsidian950,
    secondaryContainer = Obsidian800,
    onSecondaryContainer = Cyan400,
    background = Obsidian950,
    onBackground = androidx.compose.ui.graphics.Color(0xFFF1F5F9),
    surface = Obsidian900,
    onSurface = androidx.compose.ui.graphics.Color(0xFFF8FAFC),
    surfaceVariant = Obsidian800,
    onSurfaceVariant = androidx.compose.ui.graphics.Color(0xFF94A3B8)
)

private val LightColorScheme = lightColorScheme(
    primary = Emerald500,
    onPrimary = SurfaceLight,
    primaryContainer = androidx.compose.ui.graphics.Color(0xFFDCFCE7),
    onPrimaryContainer = androidx.compose.ui.graphics.Color(0xFF14532D),
    secondary = Cyan500,
    onSecondary = SurfaceLight,
    background = BackgroundLight,
    onBackground = TextDark,
    surface = SurfaceLight,
    onSurface = TextDark,
    surfaceVariant = androidx.compose.ui.graphics.Color(0xFFF1F5F9),
    onSurfaceVariant = TextMuted
)

@Composable
fun SmartPaySoundBoxTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
