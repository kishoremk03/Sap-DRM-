package com.smartpay.soundbox

import android.app.Application
import com.smartpay.soundbox.data.AppDatabase

class SmartPayApplication : Application() {
    val database: AppDatabase by lazy { AppDatabase.getDatabase(this) }

    override fun onCreate() {
        super.onCreate()
    }
}
