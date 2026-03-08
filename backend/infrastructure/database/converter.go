package database

import (
	"database/sql"
	"strconv"
)

// toNullString は*stringをsql.NullStringに変換する
func toNullString(s *string) sql.NullString {
	if s == nil {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: *s, Valid: true}
}

// fromNullString はsql.NullStringを*stringに変換する
func fromNullString(ns sql.NullString) *string {
	if !ns.Valid {
		return nil
	}
	return &ns.String
}

// toNullInt32 は*int32をsql.NullInt32に変換する
func toNullInt32(i *int32) sql.NullInt32 {
	if i == nil {
		return sql.NullInt32{Valid: false}
	}
	return sql.NullInt32{Int32: *i, Valid: true}
}

// fromNullInt32 はsql.NullInt32を*int32に変換する
func fromNullInt32(ni sql.NullInt32) *int32 {
	if !ni.Valid {
		return nil
	}
	return &ni.Int32
}

// float64ToNullString は*float64をsql.NullString（DECIMAL用）に変換する
func float64ToNullString(v *float64) sql.NullString {
	if v == nil {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: strconv.FormatFloat(*v, 'f', 2, 64), Valid: true}
}

// nullStringToFloat64 はsql.NullString（DECIMAL）を*float64に変換する
func nullStringToFloat64(v sql.NullString) *float64 {
	if !v.Valid {
		return nil
	}
	f, err := strconv.ParseFloat(v.String, 64)
	if err != nil {
		return nil
	}
	return &f
}
