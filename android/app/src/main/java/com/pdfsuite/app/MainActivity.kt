package com.pdfsuite.app

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.pdfsuite.app.ui.screens.*
import com.pdfsuite.app.ui.theme.PDFSuiteTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PDFSuiteTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    var isPremium by remember { mutableStateOf(false) }
                    var freeQuotaRemaining by remember { mutableStateOf(3) }

                    NavHost(navController = navController, startDestination = "home") {
                        composable("home") {
                            HomeScreen(
                                isPremium = isPremium,
                                freeQuotaRemaining = freeQuotaRemaining,
                                onNavigateTool = { toolId ->
                                    navController.navigate(toolId)
                                },
                                onNavigatePaywall = {
                                    navController.navigate("paywall")
                                },
                                onNavigateLogin = {
                                    navController.navigate("login")
                                }
                            )
                        }

                        composable("image_to_pdf") {
                            ImageToPdfScreen(
                                onBack = { navController.popBackStack() },
                                onConvertImages = { uris ->
                                    if (!isPremium && freeQuotaRemaining <= 0) {
                                        navController.navigate("paywall")
                                    } else {
                                        if (!isPremium) freeQuotaRemaining--
                                        Toast.makeText(this@MainActivity, "Images Converted to PDF!", Toast.LENGTH_LONG).show()
                                        navController.popBackStack()
                                    }
                                }
                            )
                        }

                        composable("login") {
                            LoginScreen(
                                onBack = { navController.popBackStack() },
                                onLoginSuccess = { auth ->
                                    isPremium = auth.user.isPremium || auth.user.role == "SUPER_ADMIN"
                                    freeQuotaRemaining = auth.user.quota?.remainingToday ?: 3
                                    Toast.makeText(this@MainActivity, "Signed in as ${auth.user.email}!", Toast.LENGTH_LONG).show()
                                    navController.popBackStack()
                                }
                            )
                        }

                        composable("paywall") {
                            PaywallScreen(
                                onClose = { navController.popBackStack() },
                                onPurchaseSubscription = { plan ->
                                    isPremium = true
                                    Toast.makeText(this@MainActivity, "Google Play Purchase Successful! Unlimited Pro active.", Toast.LENGTH_LONG).show()
                                    navController.popBackStack()
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
