// Carrega os estados na lista de seleção ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    fetchStates();
    document.getElementById('state').addEventListener('change', getCities);
    document.getElementById('city').addEventListener('change', getWeather);
});

// Carrega os estados na lista de seleção
async function fetchStates() {
    try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const states = await response.json();

        const stateSelect = document.getElementById('state');
        stateSelect.innerHTML = '<option value="">Selecione um Estado</option>'; // Opção padrão

        states.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(state => {
            const option = document.createElement('option');
            option.value = state.sigla;
            option.textContent = state.nome;
            stateSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao buscar estados:', error);
    }
}

// Carrega as cidades com base no estado selecionado
async function getCities() {
    const stateSelect = document.getElementById('state');
    const state = stateSelect.value;

    if (!state) {
        document.getElementById('city').innerHTML = '<option value="">Selecione uma cidade</option>';
        return;
    }

    try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`);
        const cities = await response.json();

        const citySelect = document.getElementById('city');
        citySelect.innerHTML = '<option value="">Selecione uma cidade</option>'; // Opção padrão

        cities.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(city => {
            const option = document.createElement('option');
            option.value = city.nome;
            option.textContent = city.nome;
            citySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao buscar cidades:', error);
    }
}

// Pega os dados do tempo da api https://weatherapi-com.p.rapidapi.com
async function getWeather() {
    const citySelect = document.getElementById('city');
    const cityName = citySelect.value;

    const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${encodeURIComponent(cityName)}&days=3&lang=portuguese`;

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'c53695aeb6msh0422de54d59cc0ep1d1fb6jsn98b5868429f6',
            'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        displayWeather(result);
    } catch (error) {
        console.error(error);
        // TODO: Adicionar um tratamento ou exibição de erro
        document.getElementById('result').textContent = 'Erro ao buscar dados do clima.';
    }
}

// Formata a data para o formato brasileiro
function formatDate(dateString) {
    const options = { year: '2-digit', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Exibe os dados do tempo na tela
function displayWeather(weatherData) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Limpar conteúdo anterior

    if (!weatherData || !weatherData.forecast || !weatherData.forecast.forecastday) {
        resultDiv.textContent = 'Não foi possível obter os dados de previsão do tempo.';
        return;
    }
	

    // Exibição: Nome da cidade, temperatura e condição climática
    const location = weatherData.location.name;
    const currentTemp = weatherData.current.temp_c;
    let condition = weatherData.current.condition.text;
    condition = weatherConditionTranslations[condition] || condition; // Traduz a condição
    const conditionImage = getConditionImage(condition); // Obtém a URL da imagem

    resultDiv.innerHTML = `<h2>${location}</h2>
                           <p><img class="weather-icon" src="${conditionImage}" alt="${condition}" style="max-width: 50px; border-radius: 50%;" /></p>
						   <p>Temperatura: ${currentTemp} °C</p>                           
						   <p>Condição: ${condition}</p>`;
						   
    // Exibir previsões para os próximos dias

    weatherData.forecast.forecastday.forEach(day => {
        const date = formatDate(day.date); // Converte a data para o formato brasileiro
        const maxTemp = day.day.maxtemp_c;
        const minTemp = day.day.mintemp_c;
        let dailyCondition = day.day.condition.text;
        dailyCondition = weatherConditionTranslations[dailyCondition] || dailyCondition; // Traduz a condição
        const dailyConditionImage = getConditionImage(dailyCondition); // Obtém a URL da imagem

        resultDiv.innerHTML += `<div class="forecast-day">
                                <h3>${date}</h3>
								<p><img src="${dailyConditionImage}" alt="${dailyCondition}" style="max-width: 50px; border-radius: 50%;" /></p>
                                <p>Máxima: ${maxTemp} °C, Mínima: ${minTemp} °C</p>
                                <p>Condição: ${dailyCondition}</p>
                            </div>`;
    });
}

// Pega o endereço da imagem correspondente à condição meteorológica
function getConditionImage(condition) {
    const conditionImageMap = {
        "Céu limpo": "./imagens/ceuLimpo.png",
        "Possibilidade de chuva irregular": "./imagens/possibilidadeChuvaIrregular.png",
        "Parcialmente nublado": "./imagens/parcialmenteNublado.png",
        "Chuva moderada": "./imagens/chuvaModerada.png",
        "Chuva intensa": "./imagens/chuvaIntensa.png",
        "Neblina": "./imagens/neblina.png",
        "Chuva moderada ou intensa com trovoadas": "./imagens/chuvaModIntensaComTrovoadas.png",
        "Ensolarado": "./imagens/ensolarado.png",
        "Nublado": "./imagens/nublado.png",
        "Chuva leve": "./imagens/chuvaLeve.png",
        "Névoa": "./imagens/névoa.png"
        // Adicione mais condições e seus respectivos caminhos de imagens conforme necessário
    };

    return conditionImageMap[condition] || "./imagens/default.png"; // Se não houver correspondência, usa uma imagem padrão
}

/*Arquivos png a criar para as condições do tempo:
ceuLimpo.png
	possibilidadeChuvaIrregular.png
	parcialmenteNublado.png
	chuvaModerada.png
	chuvaIntensa.png
	neblina.png
	chuvaModIntensaComTrovoadas.png
	ensolarado.png
	nublado.png
	chuvaLeve.png
	névoa.png*/


const weatherConditionTranslations = {
    "Clear": "Céu limpo",
    "Patchy rain possible": "Possibilidade de chuva irregular",
    "Partly cloudy": "Parcialmente nublado",
    "Moderate rain": "Chuva moderada",
    "Heavy rain": "Chuva intensa",
    "Fog": "Neblina",
    "Moderate or heavy rain with thunder": "Chuva moderada ou intensa com trovoadas",
    "Sunny": "Ensolarado",
    "Overcast": "Nublado",
    "Light rain shower": "Chuva leve",
    "Mist": "Névoa"
    // Para adicionar mais condições conforme necessário
};


