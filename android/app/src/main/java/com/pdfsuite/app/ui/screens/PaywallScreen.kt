package com.pdfsuite.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pdfsuite.app.ui.theme.AmberGold
import com.pdfsuite.app.ui.theme.BrandRose

@Composable
fun PaywallScreen(
    onClose: () -> Unit,
    onPurchaseSubscription: (String) -> Unit = {}
) {
    var tokensBalance by remember { mutableStateOf(7) }
    var dailyClaimed by remember { mutableStateOf(false) }
    var tipClaimed by remember { mutableStateOf(false) }
    var shareClaimed by remember { mutableStateOf(false) }
    var ratingClaimed by remember { mutableStateOf(false) }
    var showTipDetails by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF070913))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Close Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = Color(0xFF10B981).copy(alpha = 0.15f),
                    shape = RoundedCornerShape(20.dp),
                    border = BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.3f))
                ) {
                    Text(
                        text = "100% FREE & OPEN-SOURCE",
                        color = Color(0xFF34D399),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }

                IconButton(onClick = onClose) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Title & Balance Pill
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    Text(
                        text = "Earn Free Tokens",
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontSize = 24.sp
                    )
                    Text(
                        text = "Complete quick tasks to convert unlimited files",
                        color = Color(0xFF94A3B8),
                        fontSize = 13.sp
                    )
                }

                Surface(
                    color = AmberGold.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, AmberGold.copy(alpha = 0.3f))
                ) {
                    Text(
                        text = "🪙 $tokensBalance Tokens",
                        color = AmberGold,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Complete quick tasks to earn conversion tokens. Zero payments or credit cards needed!",
                color = Color(0xFF94A3B8),
                fontSize = 12.sp
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Task 1: Daily Login Bonus (+3)
            TaskCard(
                title = "Daily Login Bonus",
                reward = "+3 Tokens",
                description = "Claim 3 free conversion tokens every 24 hours just by opening the app.",
                isClaimed = dailyClaimed,
                buttonText = "Claim (+3)",
                onClaim = {
                    if (!dailyClaimed) {
                        dailyClaimed = true
                        tokensBalance += 3
                    }
                }
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Task 2: 10-Second Tip (+5)
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                border = BorderStroke(1.dp, Color(0xFF3B82F6).copy(alpha = 0.3f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("Read Security & Pro Tip", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(color = Color(0xFF3B82F6).copy(alpha = 0.2f), shape = RoundedCornerShape(6.dp)) {
                                    Text("+5 Tokens", color = Color(0xFF60A5FA), fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                }
                            }
                            Text("Read a 10-second document tip and instantly earn 5 tokens.", color = Color(0xFF94A3B8), fontSize = 11.sp)
                        }

                        Button(
                            onClick = {
                                showTipDetails = !showTipDetails
                                if (!tipClaimed) {
                                    tipClaimed = true
                                    tokensBalance += 5
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = if (tipClaimed) Color(0xFF10B981) else Color(0xFF2563EB)),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(if (tipClaimed) "Read ✓" else "Read Tip (+5)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    if (showTipDetails) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            color = Color(0xFF1E3A8A).copy(alpha = 0.3f),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, Color(0xFF3B82F6).copy(alpha = 0.3f))
                        ) {
                            Text(
                                text = "💡 Pro Tip: When uploading PDFs to government or university portals, choosing Compress PDF (Balanced Mode) preserves crisp clarity while reducing size by 80%!",
                                color = Color(0xFF93C5FD),
                                fontSize = 11.sp,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Task 3: Share App (+10)
            TaskCard(
                title = "Share with Friends",
                reward = "+10 Tokens",
                description = "Share PDF Suite with colleagues or WhatsApp groups to earn 10 tokens.",
                isClaimed = shareClaimed,
                buttonText = "Share Link (+10)",
                onClaim = {
                    if (!shareClaimed) {
                        shareClaimed = true
                        tokensBalance += 10
                    }
                }
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Task 4: Feedback (+5)
            TaskCard(
                title = "Rating & Feedback",
                reward = "+5 Tokens",
                description = "Leave a 5-star rating to support open-source development.",
                isClaimed = ratingClaimed,
                buttonText = "Submit (+5)",
                onClaim = {
                    if (!ratingClaimed) {
                        ratingClaimed = true
                        tokensBalance += 5
                    }
                }
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Continue Converting Button
            Button(
                onClick = onClose,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(
                    text = "Continue Converting ($tokensBalance Tokens Available)",
                    color = Color(0xFF0F172A),
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun TaskCard(
    title: String,
    reward: String,
    description: String,
    isClaimed: Boolean,
    buttonText: String,
    onClaim: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Spacer(modifier = Modifier.width(6.dp))
                    Surface(color = BrandRose.copy(alpha = 0.2f), shape = RoundedCornerShape(6.dp)) {
                        Text(reward, color = BrandRose, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                }
                Text(description, color = Color(0xFF94A3B8), fontSize = 11.sp)
            }

            Button(
                onClick = onClaim,
                enabled = !isClaimed,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isClaimed) Color(0xFF10B981) else BrandRose,
                    disabledContainerColor = Color(0xFF10B981).copy(alpha = 0.4f)
                ),
                shape = RoundedCornerShape(10.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Text(if (isClaimed) "Claimed ✓" else buttonText, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
