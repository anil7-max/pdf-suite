package com.pdfsuite.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pdfsuite.app.ui.theme.AmberGold
import com.pdfsuite.app.ui.theme.BrandRose

data class ToolItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val gradientColors: List<Color>
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    isPremium: Boolean,
    freeQuotaRemaining: Int,
    onNavigateTool: (String) -> Unit,
    onNavigatePaywall: () -> Unit,
    onNavigateLogin: () -> Unit
) {
    val tools = listOf(
        ToolItem(
            id = "image_to_pdf",
            title = "Image to PDF",
            subtitle = "Convert JPG & PNG photos to PDF",
            icon = Icons.Default.Image,
            gradientColors = listOf(BrandRose, Color(0xFFFB7185))
        ),
        ToolItem(
            id = "compress_pdf",
            title = "Compress PDF",
            subtitle = "Reduce PDF file size up to 80%",
            icon = Icons.Default.Compress,
            gradientColors = listOf(Color(0xFF059669), Color(0xFF34D399))
        ),
        ToolItem(
            id = "file_to_zip",
            title = "File to ZIP",
            subtitle = "Archive multiple files into a ZIP",
            icon = Icons.Default.FolderZip,
            gradientColors = listOf(Color(0xFF7C3AED), Color(0xFFA78BFA))
        ),
        ToolItem(
            id = "camera_scanner",
            title = "Scan Documents",
            subtitle = "CameraX native document scanner",
            icon = Icons.Default.DocumentScanner,
            gradientColors = listOf(Color(0xFFD97706), AmberGold)
        )
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "PDF",
                            fontWeight = FontWeight.Black,
                            fontSize = 22.sp,
                            color = Color(0xFF0F172A)
                        )
                        Text(
                            text = "Suite",
                            fontWeight = FontWeight.Black,
                            fontSize = 22.sp,
                            color = BrandRose
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onNavigateLogin) {
                        Icon(
                            imageVector = Icons.Default.AccountCircle,
                            contentDescription = "User Account",
                            tint = Color(0xFF475569)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            // Quota / Pro Status Pill
            if (!isPremium) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF1F2)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigatePaywall() }
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "⚡ Free Tasks Remaining: $freeQuotaRemaining",
                                fontWeight = FontWeight.Bold,
                                color = BrandRose,
                                fontSize = 14.sp
                            )
                            Text(
                                text = "Tap to unlock unlimited conversions",
                                color = Color(0xFF64748B),
                                fontSize = 12.sp
                            )
                        }
                        Button(
                            onClick = onNavigatePaywall,
                            colors = ButtonDefaults.buttonColors(containerColor = AmberGold),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Upgrade", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 12.sp)
                        }
                    }
                }
            } else {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "VIP",
                            tint = Color(0xFF059669)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "👑 Pro Member - Unlimited conversions active",
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF065F46),
                            fontSize = 13.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Document & File Tools",
                fontWeight = FontWeight.ExtraBold,
                fontSize = 18.sp,
                color = Color(0xFF1E293B)
            )

            Spacer(modifier = Modifier.height(12.dp))

            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(tools) { tool ->
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(160.dp)
                            .clickable { onNavigateTool(tool.id) }
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.SpaceBetween
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .background(
                                        brush = Brush.linearGradient(tool.gradientColors),
                                        shape = RoundedCornerShape(14.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = tool.icon,
                                    contentDescription = tool.title,
                                    tint = Color.White,
                                    modifier = Modifier.size(24.dp)
                                )
                            }

                            Column {
                                Text(
                                    text = tool.title,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = Color(0xFF0F172A)
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = tool.subtitle,
                                    fontSize = 11.sp,
                                    color = Color(0xFF64748B),
                                    lineHeight = 14.sp
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
