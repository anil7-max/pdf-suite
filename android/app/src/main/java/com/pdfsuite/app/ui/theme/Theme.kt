package com.pdfsuite.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val BrandRose = Color(0xFFE11D48)
val BrandRoseDark = Color(0xFFBE123C)
val AmberGold = Color(0xFFF59E0B)
val EmeraldGreen = Color(0xFF10B981)

private val LightColorScheme = lightColorScheme(
    primary = BrandRose,
    secondary = AmberGold,
    tertiary = EmeraldGreen,
    background = Color(0xFFF8FAFC),
    surface = Color.White,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A)
)

@Composable
fun PDFSuiteTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography(),
        content = content
    )
}
