package com.smartpay.soundbox.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {

    @Query("SELECT * FROM transactions ORDER BY timestamp DESC")
    fun getAllTransactions(): Flow<List<PaymentTransaction>>

    @Query("""
        SELECT * FROM transactions 
        WHERE (senderName LIKE '%' || :query || '%' 
           OR sourceAppName LIKE '%' || :query || '%' 
           OR upiReference LIKE '%' || :query || '%' 
           OR CAST(amount AS TEXT) LIKE '%' || :query || '%')
          AND timestamp BETWEEN :startTime AND :endTime
        ORDER BY timestamp DESC
    """)
    fun searchTransactions(
        query: String,
        startTime: Long,
        endTime: Long
    ): Flow<List<PaymentTransaction>>

    @Query("SELECT COALESCE(SUM(amount), 0.0) FROM transactions WHERE timestamp >= :startTime")
    fun getTotalAmountSince(startTime: Long): Flow<Double>

    @Query("SELECT COUNT(*) FROM transactions WHERE timestamp >= :startTime")
    fun getTransactionCountSince(startTime: Long): Flow<Int>

    @Query("SELECT COALESCE(SUM(amount), 0.0) FROM transactions WHERE timestamp BETWEEN :startTime AND :endTime")
    fun getTotalAmountInRange(startTime: Long, endTime: Long): Flow<Double>

    @Query("SELECT COUNT(*) FROM transactions WHERE timestamp BETWEEN :startTime AND :endTime")
    fun getCountInRange(startTime: Long, endTime: Long): Flow<Int>

    @Query("SELECT * FROM transactions ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentTransactions(limit: Int = 20): Flow<List<PaymentTransaction>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: PaymentTransaction): Long

    @Delete
    suspend fun deleteTransaction(transaction: PaymentTransaction)

    @Query("DELETE FROM transactions WHERE isSampleDemo = 1")
    suspend fun clearDemoTransactions()

    @Query("DELETE FROM transactions")
    suspend fun clearAll()
}
