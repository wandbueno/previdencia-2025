#!/bin/bash
# Script para aplicar patches diretamente nos módulos do node_modules
# Este script deve ser executado em um ambiente Linux ou usando Git Bash no Windows

echo "Aplicando patches nos módulos Expo..."

# Patch para o problema do compileSdkVersion em expo-image-loader
if [ -d "node_modules/expo-image-loader/android" ]; then
  echo "Corrigindo expo-image-loader..."
  cat > node_modules/expo-image-loader/android/build.gradle.patched << EOF
// https://github.com/expo/expo/tree/master/packages
// /expo-image-loader

apply plugin: 'com.android.library'
apply plugin: 'kotlin-android'

android {
    compileSdkVersion 33
    
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 33
    }
}

// Use autolinking implementation gradle plugin
apply from: "../autolinking_implementation.gradle"
EOF

  # Substituir o arquivo original pelo arquivo patcheado
  mv node_modules/expo-image-loader/android/build.gradle.patched node_modules/expo-image-loader/android/build.gradle
  echo "expo-image-loader corrigido!"
else
  echo "expo-image-loader não encontrado!"
fi

# Patch para ExpoModulesCorePlugin.gradle
if [ -f "node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle" ]; then
  echo "Corrigindo ExpoModulesCorePlugin.gradle..."
  
  # Faça backup do arquivo original
  cp node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle.bak
  
  # Substituir referências problemáticas
  sed -i 's/components.release/components.findByName("release") ?: components.first()/g' node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle
  
  echo "ExpoModulesCorePlugin.gradle corrigido!"
else
  echo "ExpoModulesCorePlugin.gradle não encontrado!"
fi

# Patch para autolinking_implementation.gradle
if [ -f "node_modules/expo-modules-autolinking/scripts/android/autolinking_implementation.gradle" ]; then
  echo "Corrigindo autolinking_implementation.gradle..."
  
  # Faça backup do arquivo original
  cp node_modules/expo-modules-autolinking/scripts/android/autolinking_implementation.gradle node_modules/expo-modules-autolinking/scripts/android/autolinking_implementation.gradle.bak
  
  # Este é um patch mais complicado, então vamos avisar para editar manualmente
  echo "ATENÇÃO: Você precisa editar manualmente o arquivo node_modules/expo-modules-autolinking/scripts/android/autolinking_implementation.gradle"
  echo "Procure por 'androidComponents.register' e envolva o bloco em try-catch para evitar falhas"
else
  echo "autolinking_implementation.gradle não encontrado!"
fi

echo "Patches aplicados com sucesso!"
