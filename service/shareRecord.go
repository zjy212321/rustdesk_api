package service

import (
	"Gwen/global"
	"Gwen/model"
	"gorm.io/gorm"
)

type ShareRecordService struct {
}

// InfoById 根据用户id取用户信息
func (srs *ShareRecordService) InfoById(id uint) *model.ShareRecord {
	u := &model.ShareRecord{}
	global.DB.Where("id = ?", id).First(u)
	return u
}

func (srs *ShareRecordService) List(page, pageSize uint, where func(tx *gorm.DB)) (res *model.ShareRecordList) {
	res = &model.ShareRecordList{}
	res.Page = int64(page)
	res.PageSize = int64(pageSize)
	tx := global.DB.Model(&model.ShareRecord{})
	if where != nil {
		where(tx)
	}
	tx.Count(&res.Total)
	tx.Scopes(Paginate(page, pageSize))
	tx.Find(&res.ShareRecords)
	return
}

// Create 创建
func (srs *ShareRecordService) Create(u *model.ShareRecord) error {
	res := global.DB.Create(u).Error
	return res
}
func (srs *ShareRecordService) Delete(u *model.ShareRecord) error {
	return global.DB.Delete(u).Error
}

// Update 更新
func (srs *ShareRecordService) Update(u *model.ShareRecord) error {
	return global.DB.Model(u).Updates(u).Error
}

func (srs *ShareRecordService) BatchDelete(ids []uint) error {
	return global.DB.Where("id in (?)", ids).Delete(&model.ShareRecord{}).Error
}
