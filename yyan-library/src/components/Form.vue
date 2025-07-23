<template>
  <div class="container mt-5">
    <!-- 表单部分 -->
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">User Information Form</h1>
        <form @submit.prevent="submitForm">
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="username" class="form-label">Username</label>
              <input type="text" class="form-control" id="username"
                     @blur="() => validateName(true)"
                     @input="() => validateName(false)"
                     v-model="formData.username">
              <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
            </div>
            <div class="col-md-6">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password"
                     @blur="() => validatePassword(true)"
                     @input="() => validatePassword(false)"
                     v-model="formData.password">
              <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6">
              <div class="form-check">
                <input type="checkbox" class="form-check-input" id="isAustralian"
                       v-model="formData.isAustralian" @change="validateResident">
                <label class="form-check-label" for="isAustralian">Australian Resident?</label>
              </div>
              <div v-if="errors.resident" class="text-danger">{{ errors.resident }}</div>
            </div>
            <div class="col-md-6">
              <label for="gender" class="form-label">Gender</label>
              <select class="form-select" id="gender" v-model="formData.gender" @change="validateGender">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>
            </div>
          </div>
          <div class="mb-3">
            <label for="reason" class="form-label">Reason for joining</label>
            <textarea class="form-control" id="reason" rows="3"
                      v-model="formData.reason"
                      @blur="() => validateReason(true)"
                      @input="() => validateReason(false)"></textarea>
            <div v-if="errors.reason" class="text-danger">{{ errors.reason }}</div>
          </div>
          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2">Submit</button>
            <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
          </div>
        </form>
      </div>
    </div>

    <!-- PrimeVue DataTable部分 -->
    <div class="row mt-5">
      <div class="col-12">
        <DataTable
          :value="submittedCards"
          tableStyle="min-width: 50rem"
          class="simple-datatable">

          <Column field="username" header="Username">
          </Column>

          <Column field="password" header="Password">
          </Column>

          <Column field="isAustralian" header="Australian Resident">
            <template #body="slotProps">
              {{ slotProps.data.isAustralian ? 'true' : 'false' }}
            </template>
          </Column>

          <Column field="gender" header="Gender">
          </Column>

          <Column field="reason" header="Reason">
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
    username: '',
    password: '',
    isAustralian: false,
    reason: '',
    gender: ''
});

const submittedCards = ref([
  {
    username: 'Jinx',
    password: '123456Qq@',
    isAustralian: true,
    gender: 'male',
    reason: 'None'
  },
  {
    username: 'Delvin',
    password: '123444@#Ww',
    isAustralian: true,
    gender: 'male',
    reason: 'Love reading'
  },
  {
    username: 'Yiwei',
    password: '4567895Rr',
    isAustralian: true,
    gender: 'male',
    reason: 'Feel Boring'
  }
]);

const errors = ref({
    username: null,
    password: null,
    resident: null,
    reason: null,
    gender: null
});

const submitForm = () => {
    validateName(true);
    validatePassword(true);
    validateResident();
    validateGender();
    validateReason(true);

    const hasErrors = Object.values(errors.value).some(error => error !== null);

    if (!hasErrors) {
        submittedCards.value.push({
            ...formData.value
        });
        clearForm();
    }
};

const clearForm = () => {
    formData.value = {
        username: '',
        password: '',
        isAustralian: false,
        reason: '',
        gender: ''
    };
    // 清除所有错误
    Object.keys(errors.value).forEach(key => {
        errors.value[key] = null;
    });
};

const validateName = (blur) => {
    if (formData.value.username.length < 3) {
        if(blur) {
            errors.value.username = 'Username must be at least 3 characters';
        }
    } else {
        errors.value.username = null;
    }
};

const validatePassword = (blur) => {
    const password = formData.value.password;
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`;
    } else if (!hasUppercase) {
        if (blur) errors.value.password = "Password must contain at least one uppercase letter.";
    } else if (!hasLowercase) {
        if (blur) errors.value.password = "Password must contain at least one lowercase letter.";
    } else if (!hasNumber) {
        if (blur) errors.value.password = "Password must contain at least one number.";
    } else if (!hasSpecialChar) {
        if (blur) errors.value.password = "Password must contain at least one special character.";
    } else {
        errors.value.password = null;
    }
};

const validateResident = () => {
    errors.value.resident = null;
};

const validateGender = () => {
    if (!formData.value.gender || formData.value.gender === '') {
        errors.value.gender = 'Please select a gender.';
    } else {
        errors.value.gender = null;
    }
};

const validateReason = (blur) => {
    const reason = formData.value.reason.trim();

    if (reason.length === 0) {
        if (blur) {
            errors.value.reason = 'Please provide a reason for joining.';
        }
    } else if (reason.length < 10) {
        if (blur) {
            errors.value.reason = 'Reason must be at least 10 characters long.';
        }
    } else if (reason.length > 500) {
        if (blur) {
            errors.value.reason = 'Reason must be less than 500 characters.';
        }
    } else {
        errors.value.reason = null;
    }
};

</script>

<style scoped>
/* 简洁的DataTable样式 */
:deep(.simple-datatable) {
  border: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.simple-datatable .p-datatable-table) {
  border-collapse: separate;
  border-spacing: 0;
}

:deep(.simple-datatable .p-datatable-thead > tr > th) {
  background: transparent;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  color: #666;
  font-weight: 500;
  font-size: 14px;
  padding: 12px 16px;
  text-align: left;
}

:deep(.simple-datatable .p-datatable-tbody > tr > td) {
  border: none;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  font-size: 14px;
  padding: 12px 16px;
  background: transparent;
}

:deep(.simple-datatable .p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

:deep(.simple-datatable .p-datatable-tbody > tr:hover > td) {
  background: transparent;
}

/* 移除所有边框和阴影 */
:deep(.simple-datatable .p-datatable-wrapper) {
  border: none;
  box-shadow: none;
}
</style>
